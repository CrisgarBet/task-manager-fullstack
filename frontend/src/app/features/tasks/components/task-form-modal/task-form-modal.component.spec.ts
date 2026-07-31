import { TestBed } from '@angular/core/testing';
import { TaskFormModalComponent } from './task-form-modal.component';

describe('TaskFormModalComponent', () => {
  it('rechaza un título vacío y acepta uno válido', () => {
    const fixture = TestBed.createComponent(TaskFormModalComponent);
    const component = fixture.componentInstance;
    component.form.controls.title.setValue('   ');
    expect(component.form.invalid).toBeTrue();
    component.form.controls.title.setValue('Preparar demo');
    expect(component.form.valid).toBeTrue();
  });

  it('rechaza valores que superan los límites del formulario', () => {
    const fixture = TestBed.createComponent(TaskFormModalComponent);
    const form = fixture.componentInstance.form;

    form.controls.title.setValue('a'.repeat(101));
    expect(form.controls.title.hasError('maxlength')).toBeTrue();

    form.controls.title.setValue('Título válido');
    form.controls.description.setValue('a'.repeat(501));
    expect(form.controls.description.hasError('maxlength')).toBeTrue();
    expect(form.invalid).toBeTrue();
  });
});
