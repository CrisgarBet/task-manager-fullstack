import cors from 'cors';
import express, { type Express } from 'express';
import { createDatabase, type DatabaseConnection } from './config/database.js';
import { env } from './config/env.js';
import { TaskController } from './controllers/task.controller.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { TaskRepository } from './repositories/task.repository.js';
import { createTaskRouter } from './routes/task.routes.js';
import { TaskService } from './services/task.service.js';

export interface AppContext {
  app: Express;
  database: DatabaseConnection;
}

export function createApp(database = createDatabase()): AppContext {
  const app = express();
  const controller = new TaskController(new TaskService(new TaskRepository(database)));

  app.use(cors({ origin: env.FRONTEND_URL }));
  app.use(express.json({ limit: '20kb' }));
  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/tasks', createTaskRouter(controller));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return { app, database };
}
