import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="py-5 text-center" role="status" aria-live="polite">
      <div class="spinner-border text-primary" aria-hidden="true"></div>
      <p class="mt-3 text-secondary">Cargando tareas…</p>
    </div>
  `,
})
export class LoadingSpinnerComponent {}
