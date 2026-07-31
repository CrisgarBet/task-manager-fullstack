import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, EMPTY, catchError, finalize, forkJoin, switchMap } from 'rxjs';
import type { Task, TaskFilters, TaskInput, TaskStatus } from '../../../../core/models/task.model';
import { UserFacingError } from '../../../../core/interceptors/http-error.interceptor';
import { TaskService } from '../../../../core/services/task.service';
import { ConfirmationModalComponent } from '../../../../shared/components/confirmation-modal/confirmation-modal.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import {
  ToastComponent,
  type ToastMessage,
} from '../../../../shared/components/toast/toast.component';
import { TaskFiltersComponent } from '../../components/task-filters/task-filters.component';
import { TaskFormModalComponent } from '../../components/task-form-modal/task-form-modal.component';
import { TaskListComponent } from '../../components/task-list/task-list.component';
import { TaskSummaryComponent } from '../../components/task-summary/task-summary.component';

@Component({
  selector: 'app-tasks-page',
  imports: [
    TaskSummaryComponent,
    TaskFiltersComponent,
    TaskListComponent,
    TaskFormModalComponent,
    ConfirmationModalComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
    ToastComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="container py-4 py-md-5 d-flex justify-content-between align-items-center gap-3">
        <div>
          <span class="eyebrow">ORGANIZA TU DÍA</span>
          <h1 class="h2 mb-1">Gestor de tareas</h1>
          <p class="mb-0">Crea, prioriza y completa tus pendientes desde un solo lugar.</p>
        </div>
        <button
          class="btn btn-light fw-semibold flex-shrink-0"
          type="button"
          (click)="openCreate()"
        >
          + Nueva tarea
        </button>
      </div>
    </header>
    <main class="container py-4">
      <app-task-summary [tasks]="allTasks()" />
      <div class="my-4"><app-task-filters (filtersChange)="setFilters($event)" /></div>
      @if (loading()) {
        <app-loading-spinner />
      } @else if (tasks().length) {
        <app-task-list
          [tasks]="tasks()"
          [busyId]="busyId()"
          (edit)="openEdit($event)"
          (remove)="taskToDelete.set($event)"
          (statusChange)="changeStatus($event.task, $event.status)"
        />
      } @else {
        <app-empty-state [filtered]="hasFilters()" (create)="openCreate()" />
      }
    </main>
    <app-task-form-modal
      [open]="formOpen()"
      [task]="editingTask()"
      [saving]="saving()"
      [error]="formError()"
      (dismissed)="closeForm()"
      (saved)="saveTask($event)"
    />
    <app-confirmation-modal
      [task]="taskToDelete()"
      [busy]="deleting()"
      (dismissed)="taskToDelete.set(null)"
      (confirmed)="deleteTask()"
    />
    <app-toast [message]="toast()" (closed)="toast.set(null)" />
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: #f6f7fb;
    }
    .app-header {
      color: #fff;
      background: linear-gradient(125deg, #192d61, #315fc5);
    }
    .app-header p {
      color: #dce6ff;
    }
    .eyebrow {
      color: #b9cbff;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.13em;
    }
    @media (max-width: 575px) {
      .app-header .container {
        align-items: flex-start !important;
        flex-direction: column;
      }
    }
  `,
})
export class TasksPageComponent {
  private readonly taskService = inject(TaskService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filters$ = new BehaviorSubject<TaskFilters>({});
  private currentFilters: TaskFilters = {};
  private toastTimer?: ReturnType<typeof setTimeout>;

  readonly tasks = signal<Task[]>([]);
  readonly allTasks = signal<Task[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly editingTask = signal<Task | null>(null);
  readonly saving = signal(false);
  readonly formError = signal<string | null>(null);
  readonly taskToDelete = signal<Task | null>(null);
  readonly deleting = signal(false);
  readonly toast = signal<ToastMessage | null>(null);

  constructor() {
    this.filters$
      .pipe(
        switchMap((filters) => {
          this.loading.set(true);
          return forkJoin({
            tasks: this.taskService.getTasks(filters),
            all: this.taskService.getTasks(),
          }).pipe(
            catchError((error: unknown) => {
              this.showToast(this.errorMessage(error), 'danger');
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ tasks, all }) => {
        this.tasks.set(tasks);
        this.allTasks.set(all);
      });
  }

  setFilters(filters: TaskFilters): void {
    this.currentFilters = filters;
    this.filters$.next(filters);
  }

  hasFilters(): boolean {
    return Boolean(this.currentFilters.search || this.currentFilters.status);
  }

  openCreate(): void {
    this.editingTask.set(null);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(task: Task): void {
    this.editingTask.set(task);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (!this.saving()) this.formOpen.set(false);
  }

  saveTask(input: TaskInput): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    const editing = this.editingTask();
    const request = editing
      ? this.taskService.updateTask(editing.id, input)
      : this.taskService.createTask(input);
    request.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: () => {
        this.formOpen.set(false);
        this.showToast(
          editing ? 'Tarea actualizada correctamente.' : 'Tarea creada correctamente.',
          'success',
        );
        this.refresh();
      },
      error: (error: unknown) => this.formError.set(this.errorMessage(error)),
    });
  }

  changeStatus(task: Task, status: TaskStatus): void {
    if (this.busyId()) return;
    this.busyId.set(task.id);
    this.taskService
      .updateTask(task.id, { title: task.title, description: task.description, status })
      .pipe(finalize(() => this.busyId.set(null)))
      .subscribe({
        next: () => {
          this.showToast('Estado actualizado.', 'success');
          this.refresh();
        },
        error: (error: unknown) => {
          this.showToast(this.errorMessage(error), 'danger');
          this.refresh();
        },
      });
  }

  deleteTask(): void {
    const task = this.taskToDelete();
    if (!task || this.deleting()) return;
    this.deleting.set(true);
    this.busyId.set(task.id);
    this.taskService
      .deleteTask(task.id)
      .pipe(
        finalize(() => {
          this.deleting.set(false);
          this.busyId.set(null);
        }),
      )
      .subscribe({
        next: () => {
          this.taskToDelete.set(null);
          this.showToast('Tarea eliminada correctamente.', 'success');
          this.refresh();
        },
        error: (error: unknown) => this.showToast(this.errorMessage(error), 'danger'),
      });
  }

  private refresh(): void {
    this.filters$.next(this.currentFilters);
  }

  private errorMessage(error: unknown): string {
    return error instanceof UserFacingError ? error.message : 'Ocurrió un error inesperado.';
  }

  private showToast(text: string, type: ToastMessage['type']): void {
    this.toast.set({ text, type });
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 4500);
  }
}
