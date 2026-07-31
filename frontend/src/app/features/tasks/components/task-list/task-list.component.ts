import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card.component';

@Component({
  selector: 'app-task-list',
  imports: [TaskCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="row g-4">
      @for (task of tasks(); track task.id) {
        <div class="col-12 col-md-6 col-xl-4">
          <app-task-card
            [task]="task"
            [busy]="busyId() === task.id"
            (edit)="edit.emit($event)"
            (remove)="remove.emit($event)"
            (statusChange)="statusChange.emit($event)"
          />
        </div>
      }
    </div>
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<Task[]>();
  readonly busyId = input<string | null>(null);
  readonly edit = output<Task>();
  readonly remove = output<Task>();
  readonly statusChange = output<{ task: Task; status: TaskStatus }>();
}
