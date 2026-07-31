import { ChangeDetectionStrategy, Component, DestroyRef, inject, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import type { TaskFilters, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-filters',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="filters card border-0 shadow-sm">
      <div class="card-body row g-3 align-items-end">
        <div class="col-12 col-md">
          <label for="task-search" class="form-label">Buscar</label>
          <input
            id="task-search"
            type="search"
            class="form-control"
            placeholder="Título o descripción"
            [formControl]="searchControl"
          />
        </div>
        <div class="col-12 col-md-4">
          <label for="task-status" class="form-label">Estado</label>
          <select id="task-status" class="form-select" [formControl]="statusControl">
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="in_progress">En progreso</option>
            <option value="done">Completada</option>
          </select>
        </div>
        <div class="col-12 col-md-auto">
          <button
            class="btn btn-outline-secondary w-100"
            type="button"
            (click)="clear()"
            [disabled]="!searchControl.value && !statusControl.value"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </section>
  `,
  styles: `
    .filters {
      border-radius: 1rem;
    }
    .form-label {
      font-weight: 600;
      color: #3b435a;
    }
  `,
})
export class TaskFiltersComponent {
  readonly filtersChange = output<TaskFilters>();
  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly statusControl = new FormControl('', { nonNullable: true });
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.searchControl.valueChanges
      .pipe(debounceTime(350), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
    this.statusControl.valueChanges
      .pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
  }

  clear(): void {
    this.searchControl.setValue('', { emitEvent: false });
    this.statusControl.setValue('', { emitEvent: false });
    this.emitFilters();
  }

  private emitFilters(): void {
    const search = this.searchControl.value.trim();
    const status = this.statusControl.value as TaskStatus | '';
    this.filtersChange.emit({
      ...(search ? { search } : {}),
      ...(status ? { status } : {}),
    });
  }
}
