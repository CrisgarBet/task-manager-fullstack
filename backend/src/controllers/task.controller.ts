import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { createTaskSchema, taskFiltersSchema, updateTaskSchema } from '../schemas/task.schema.js';
import type { TaskService } from '../services/task.service.js';
import { ApiError } from '../types/api-error.js';

interface TaskParams {
  id: string;
}

function parse<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError(
      400,
      'Los datos enviados no son válidos',
      result.error.issues.map((issue) => ({
        field: issue.path.join('.') || 'body',
        message:
          issue.code === 'unrecognized_keys' ? 'No se permiten campos adicionales' : issue.message,
      })),
    );
  }
  return result.data;
}

export class TaskController {
  constructor(private readonly service: TaskService) {}

  list = (request: Request, response: Response, next: NextFunction): void => {
    try {
      response.json(this.service.getTasks(parse(taskFiltersSchema, request.query)));
    } catch (error) {
      next(error);
    }
  };

  getById = (request: Request<TaskParams>, response: Response, next: NextFunction): void => {
    try {
      response.json(this.service.getTask(request.params.id));
    } catch (error) {
      next(error);
    }
  };

  create = (request: Request, response: Response, next: NextFunction): void => {
    try {
      const task = this.service.createTask(parse(createTaskSchema, request.body));
      response.location(`/api/tasks/${task.id}`).status(201).json(task);
    } catch (error) {
      next(error);
    }
  };

  update = (request: Request<TaskParams>, response: Response, next: NextFunction): void => {
    try {
      response.json(
        this.service.updateTask(request.params.id, parse(updateTaskSchema, request.body)),
      );
    } catch (error) {
      next(error);
    }
  };

  delete = (request: Request<TaskParams>, response: Response, next: NextFunction): void => {
    try {
      this.service.deleteTask(request.params.id);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
