import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="empty text-center">
      <div class="icon" aria-hidden="true">✓</div>
      <h2 class="h4">{{ filtered() ? 'No encontramos coincidencias' : 'Aún no hay tareas' }}</h2>
      <p class="text-secondary">
        {{
          filtered()
            ? 'Prueba cambiando o limpiando los filtros.'
            : 'Crea tu primera tarea para comenzar.'
        }}
      </p>
      @if (!filtered()) {
        <button type="button" class="btn btn-primary" (click)="create.emit()">
          Crear primera tarea
        </button>
      }
    </section>
  `,
  styles: `
    .empty {
      background: white;
      border: 1px dashed #cbd0dc;
      border-radius: 1rem;
      padding: 3.5rem 1rem;
    }
    .icon {
      display: grid;
      place-items: center;
      margin: 0 auto 1rem;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background: #e7efff;
      color: #275fc5;
      font-size: 1.4rem;
    }
  `,
})
export class EmptyStateComponent {
  readonly filtered = input(false);
  readonly create = output<void>();
}
