import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envía filtros al listar tareas', () => {
    service
      .getTasks({ status: 'done', search: 'demo' })
      .subscribe((tasks) => expect(tasks).toEqual([]));
    const request = http.expectOne(`${environment.apiUrl}/tasks?status=done&search=demo`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });
});
