import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { TimeoutError, catchError, throwError, timeout } from 'rxjs';

const REQUEST_TIMEOUT_MS = 10_000;
const HTTP_ERROR_MESSAGES: Readonly<Record<number, string>> = {
  400: 'Revisa los campos del formulario.',
  404: 'La tarea ya no existe.',
  413: 'La solicitud contiene demasiados datos.',
  500: 'Ocurrió un error inesperado.',
};

export class UserFacingError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
  }
}

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((error: unknown) => {
      if (error instanceof TimeoutError) {
        return throwError(() => new UserFacingError('La solicitud tardó demasiado.'));
      }
      if (error instanceof HttpErrorResponse) {
        const message =
          error.status === 0
            ? 'No fue posible conectarse con el servidor.'
            : (HTTP_ERROR_MESSAGES[error.status] ?? 'Ocurrió un error inesperado.');
        return throwError(() => new UserFacingError(message, error.status));
      }
      return throwError(() => new UserFacingError('Ocurrió un error inesperado.'));
    }),
  );
