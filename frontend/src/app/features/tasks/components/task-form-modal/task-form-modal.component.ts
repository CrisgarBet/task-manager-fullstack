import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Task, TaskInput, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-form-modal',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="modal-backdrop-custom">
        <section
          class="modal-card"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-form-title"
          tabindex="-1"
        >
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 id="task-form-title" class="h4 mb-0">
              {{ task() ? 'Editar tarea' : 'Nueva tarea' }}
            </h2>
            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar"
              (click)="dismissed.emit()"
              [disabled]="saving()"
            ></button>
          </div>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <label for="title" class="form-label">Título</label>
                <small class="text-secondary">{{ form.controls.title.value.length }}/100</small>
              </div>
              <input
                id="title"
                class="form-control"
                formControlName="title"
                maxlength="100"
                [class.is-invalid]="showError('title')"
                aria-describedby="title-error"
              />
              @if (showError('title')) {
                <div id="title-error" class="invalid-feedback">
                  El título es obligatorio y no puede superar 100 caracteres.
                </div>
              }
            </div>
            <div class="mb-3">
              <div class="d-flex justify-content-between">
                <label for="description" class="form-label"
                  >Descripción <span class="text-secondary">(opcional)</span></label
                >
                <small class="text-secondary"
                  >{{ form.controls.description.value.length }}/500</small
                >
              </div>
              <textarea
                id="description"
                class="form-control"
                rows="4"
                maxlength="500"
                formControlName="description"
                [class.is-invalid]="showError('description')"
                aria-describedby="description-error"
              ></textarea>
              @if (showError('description')) {
                <div id="description-error" class="invalid-feedback">
                  La descripción no puede superar 500 caracteres.
                </div>
              }
            </div>
            <div class="mb-4">
              <label for="form-status" class="form-label">Estado</label>
              <select id="form-status" class="form-select" formControlName="status">
                <option value="pending">Pendiente</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>
            @if (error()) {
              <div class="alert alert-danger py-2" role="alert">{{ error() }}</div>
            }
            <div class="d-flex justify-content-end gap-2">
              <button
                type="button"
                class="btn btn-outline-secondary"
                (click)="dismissed.emit()"
                [disabled]="saving()"
              >
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="saving()">
                {{ saving() ? 'Guardando…' : task() ? 'Guardar cambios' : 'Crear tarea' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
  styles: `
    .modal-backdrop-custom {
      position: fixed;
      inset: 0;
      z-index: 1050;
      padding: 1rem;
      display: grid;
      place-items: center;
      background: rgba(18, 25, 43, 0.55);
      overflow-y: auto;
    }
    .modal-card {
      width: min(100%, 600px);
      background: #fff;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
    .form-label {
      font-weight: 600;
      color: #3b435a;
    }
  `,
})
export class TaskFormModalComponent {
  readonly open = input(false);
  readonly task = input<Task | null>(null);
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly dismissed = output<void>();
  readonly saved = output<TaskInput>();
  submitted = false;

  readonly form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100), Validators.pattern(/\S/)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
    status: new FormControl<TaskStatus>('pending', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const task = this.task();
      this.submitted = false;
      this.form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        status: task?.status ?? 'pending',
      });
    });
  }

  showError(control: 'title' | 'description'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({
      title: value.title.trim(),
      description: value.description.trim() || null,
      status: value.status,
    });
  }
}
