import type { RequestHandler } from 'express';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    statusCode: 404,
    message: 'La ruta solicitada no existe',
    timestamp: new Date().toISOString(),
    path: request.originalUrl,
  });
};
