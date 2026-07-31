import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { httpErrorInterceptor, UserFacingError } from './http-error.interceptor';

describe('httpErrorInterceptor', () => {
  let http: HttpTestingController;
  let client: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([httpErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    client = TestBed.inject(HttpClient);
  });

  afterEach(() => http.verify());

  it('traduce un 404 a un mensaje comprensible', (done) => {
    client.get('/api/tasks/missing').subscribe({
      error: (error: unknown) => {
        expect(error).toEqual(jasmine.any(UserFacingError));
        expect((error as UserFacingError).message).toBe('La tarea ya no existe.');
        done();
      },
    });
    http.expectOne('/api/tasks/missing').flush({}, { status: 404, statusText: 'Not Found' });
  });

  it('diferencia un error de red', (done) => {
    client.get('/api/tasks').subscribe({
      error: (error: unknown) => {
        expect((error as UserFacingError).message).toBe(
          'No fue posible conectarse con el servidor.',
        );
        done();
      },
    });
    http.expectOne('/api/tasks').error(new ProgressEvent('error'));
  });
});
