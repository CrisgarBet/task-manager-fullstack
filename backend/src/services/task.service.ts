import { randomUUID } from 'node:crypto';
import type { Task, TaskFilters, TaskInput } from '../models/task.model.js';
import type { TaskRepository } from '../repositories/task.repository.js';
import { ApiError } from '../types/api-error.js';

export class TaskService {
  constructor(private readonly repository: TaskRepository) {}

  getTasks(filters: TaskFilters): Task[] {
    return this.repository.findAll(filters);
  }

  getTask(id: string): Task {
    const task = this.repository.findById(id);
    if (!task) throw new ApiError(404, 'La tarea no existe');
    return task;
  }

  createTask(input: TaskInput): Task {
    const now = new Date().toISOString();
    return this.repository.create({ id: randomUUID(), ...input, createdAt: now, updatedAt: now });
  }

  updateTask(id: string, input: TaskInput): Task {
    this.getTask(id);
    const task = this.repository.update(id, input, new Date().toISOString());
    if (!task) throw new ApiError(404, 'La tarea no existe');
    return task;
  }

  deleteTask(id: string): void {
    if (!this.repository.delete(id)) throw new ApiError(404, 'La tarea no existe');
  }
}
