import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-confirmation-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (task(); as selected) {
      <div class="modal-backdrop-custom">
        <section
          class="modal-card"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          tabindex="-1"
        >
          <h2 id="confirm-title" class="h5">Eliminar tarea</h2>
          <p>
            ¿Seguro que deseas eliminar <strong>{{ selected.title }}</strong
            >? Esta acción no se puede deshacer.
          </p>
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-outline-secondary"
              (click)="dismissed.emit()"
              [disabled]="busy()"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="btn btn-danger"
              (click)="confirmed.emit()"
              [disabled]="busy()"
            >
              {{ busy() ? 'Eliminando…' : 'Eliminar' }}
            </button>
          </div>
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
    }
    .modal-card {
      width: min(100%, 440px);
      background: #fff;
      padding: 1.5rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    }
  `,
})
export class ConfirmationModalComponent {
  readonly task = input<Task | null>(null);
  readonly busy = input(false);
  readonly dismissed = output<void>();
  readonly confirmed = output<void>();
}
