import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Task, TaskStatus } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card task-card h-100 border-0">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between gap-3 align-items-start">
          <h2 class="h5 mb-2 text-break">{{ task().title }}</h2>
          <span class="badge rounded-pill" [class]="badgeClass(task().status)">
            {{ statusLabel(task().status) }}
          </span>
        </div>
        @if (task().description) {
          <p class="description mb-3">{{ task().description }}</p>
        } @else {
          <p class="description empty mb-3">Sin descripción</p>
        }
        <div class="dates mt-auto mb-3">
          <div>Creada: {{ task().createdAt | date: 'dd/MM/yyyy, HH:mm' }}</div>
          <div>Actualizada: {{ task().updatedAt | date: 'dd/MM/yyyy, HH:mm' }}</div>
        </div>
        <label class="form-label small fw-semibold" [for]="'status-' + task().id"
          >Cambiar estado</label
        >
        <select
          class="form-select form-select-sm mb-3"
          [id]="'status-' + task().id"
          [value]="task().status"
          (change)="changeStatus($event)"
          [disabled]="busy()"
        >
          <option value="pending">Pendiente</option>
          <option value="in_progress">En progreso</option>
          <option value="done">Completada</option>
        </select>
        <div class="d-flex gap-2">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm flex-fill"
            (click)="edit.emit(task())"
            [disabled]="busy()"
          >
            Editar
          </button>
          <button
            type="button"
            class="btn btn-outline-danger btn-sm flex-fill"
            (click)="remove.emit(task())"
            [disabled]="busy()"
            [attr.aria-label]="'Eliminar ' + task().title"
          >
            {{ busy() ? 'Procesando…' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </article>
  `,
  styles: `
    .task-card {
      border-radius: 1rem;
      box-shadow: 0 8px 28px rgba(31, 42, 68, 0.08);
      transition: transform 0.18s;
    }
    .task-card:hover {
      transform: translateY(-2px);
    }
    h2 {
      color: #17213d;
    }
    .description {
      color: #515a70;
      white-space: pre-line;
      overflow-wrap: anywhere;
    }
    .description.empty {
      color: #9198aa;
      font-style: italic;
    }
    .dates {
      color: #788096;
      font-size: 0.76rem;
    }
    .badge-pending {
      background: #fff1cc;
      color: #785700;
    }
    .badge-progress {
      background: #dce9ff;
      color: #164d9d;
    }
    .badge-done {
      background: #d8f4e6;
      color: #12633d;
    }
  `,
})
export class TaskCardComponent {
  readonly task = input.required<Task>();
  readonly busy = input(false);
  readonly edit = output<Task>();
  readonly remove = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();

  statusLabel(status: TaskStatus): string {
    return { pending: 'Pendiente', in_progress: 'En progreso', done: 'Completada' }[status];
  }

  badgeClass(status: TaskStatus): string {
    return { pending: 'badge-pending', in_progress: 'badge-progress', done: 'badge-done' }[status];
  }

  changeStatus(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TaskStatus;
    if (status !== this.task().status) this.statusChange.emit({ task: this.task(), status });
  }
}
