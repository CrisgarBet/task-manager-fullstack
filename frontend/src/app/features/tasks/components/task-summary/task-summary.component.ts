import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="row g-3" aria-label="Resumen de tareas">
      @for (item of summary(); track item.label) {
        <div class="col-6 col-lg-3">
          <div class="summary-card h-100">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      }
    </section>
  `,
  styles: `
    .summary-card {
      background: #fff;
      border: 1px solid #e8eaf0;
      border-radius: 1rem;
      padding: 1rem 1.1rem;
      box-shadow: 0 5px 20px rgba(31, 42, 68, 0.04);
    }
    span {
      color: #687086;
      font-size: 0.82rem;
      font-weight: 600;
    }
    strong {
      display: block;
      color: #17213d;
      font-size: 1.65rem;
      line-height: 1.2;
    }
  `,
})
export class TaskSummaryComponent {
  readonly tasks = input.required<Task[]>();

  summary(): { label: string; value: number }[] {
    const tasks = this.tasks();
    return [
      { label: 'Total', value: tasks.length },
      { label: 'Pendientes', value: tasks.filter((task) => task.status === 'pending').length },
      { label: 'En progreso', value: tasks.filter((task) => task.status === 'in_progress').length },
      { label: 'Completadas', value: tasks.filter((task) => task.status === 'done').length },
    ];
  }
}
