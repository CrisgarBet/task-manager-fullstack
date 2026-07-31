import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'danger';
}

@Component({
  selector: 'app-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message(); as toast) {
      <div class="toast-wrap" aria-live="polite">
        <div
          class="alert shadow d-flex align-items-center gap-3 mb-0"
          [class.alert-success]="toast.type === 'success'"
          [class.alert-danger]="toast.type === 'danger'"
        >
          <span class="flex-grow-1">{{ toast.text }}</span>
          <button
            type="button"
            class="btn-close"
            aria-label="Cerrar notificación"
            (click)="closed.emit()"
          ></button>
        </div>
      </div>
    }
  `,
  styles: `
    .toast-wrap {
      position: fixed;
      z-index: 1100;
      top: 1rem;
      right: 1rem;
      width: min(92vw, 380px);
    }
  `,
})
export class ToastComponent {
  readonly message = input<ToastMessage | null>(null);
  readonly closed = output<void>();
}
