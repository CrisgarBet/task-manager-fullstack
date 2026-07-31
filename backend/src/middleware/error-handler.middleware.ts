import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env.js';
import { ApiError, type ValidationDetail } from '../types/api-error.js';

interface RequestBodyError extends Error {
  type?: string;
}

interface ErrorDetails {
  statusCode: number;
  message: string;
  errors?: ValidationDetail[];
}

function isRequestBodyError(error: unknown): error is RequestBodyError {
  if (!(error instanceof Error)) return false;
  const bodyError = error as RequestBodyError;
  return bodyError.type === 'entity.parse.failed' || bodyError.type === 'entity.too.large';
}

function getErrorDetails(error: unknown): ErrorDetails {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message, errors: error.errors };
  }
  if (isRequestBodyError(error) && error.type === 'entity.too.large') {
    return { statusCode: 413, message: 'El cuerpo de la solicitud excede el tamaño permitido' };
  }
  if (isRequestBodyError(error)) {
    return { statusCode: 400, message: 'El cuerpo de la solicitud contiene JSON inválido' };
  }
  return { statusCode: 500, message: 'Ocurrió un error interno' };
}

export const errorHandler: ErrorRequestHandler = (error, request, response, _next) => {
  void _next;
  const details = getErrorDetails(error);
  if (details.statusCode === 500 && env.NODE_ENV === 'development') console.error(error);

  response.status(details.statusCode).json({
    statusCode: details.statusCode,
    message: details.message,
    ...(details.errors ? { errors: details.errors } : {}),
    timestamp: new Date().toISOString(),
    path: request.originalUrl,
  });
};
