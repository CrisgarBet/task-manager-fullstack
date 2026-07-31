import { TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('muestra el estado vacío inicial', () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.componentRef.setInput('filtered', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aún no hay tareas');
    expect(fixture.nativeElement.textContent).toContain('Crear primera tarea');
  });
});
