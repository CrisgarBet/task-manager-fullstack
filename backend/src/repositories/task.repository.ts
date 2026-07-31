import type { DatabaseConnection } from '../config/database.js';
import type { Task, TaskFilters, TaskInput } from '../models/task.model.js';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: Task['status'];
  created_at: string;
  updated_at: string;
}

const mapTask = (row: TaskRow): Task => ({
  id: row.id,
  title: row.title,
  description: row.description,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class TaskRepository {
  constructor(private readonly database: DatabaseConnection) {}

  findAll(filters: TaskFilters): Task[] {
    const conditions: string[] = [];
    const parameters: Record<string, string> = {};
    if (filters.status) {
      conditions.push('status = @status');
      parameters.status = filters.status;
    }
    if (filters.search) {
      conditions.push(
        "(unicode_lower(title) LIKE @search ESCAPE '\\' OR unicode_lower(description) LIKE @search ESCAPE '\\')",
      );
      const escaped = filters.search.toLocaleLowerCase('es').replace(/[\\%_]/g, '\\$&');
      parameters.search = `%${escaped}%`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    return this.database
      .prepare(`SELECT * FROM tasks ${where} ORDER BY created_at DESC`)
      .all(parameters)
      .map((row) => mapTask(row as TaskRow));
  }

  findById(id: string): Task | null {
    const row = this.database.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as
      TaskRow | undefined;
    return row ? mapTask(row) : null;
  }

  create(task: Task): Task {
    this.database
      .prepare(
        `INSERT INTO tasks (id, title, description, status, created_at, updated_at)
         VALUES (@id, @title, @description, @status, @createdAt, @updatedAt)`,
      )
      .run(task);
    return task;
  }

  update(id: string, input: TaskInput, updatedAt: string): Task | null {
    this.database
      .prepare(
        `UPDATE tasks SET title = @title, description = @description,
         status = @status, updated_at = @updatedAt WHERE id = @id`,
      )
      .run({ id, ...input, updatedAt });
    return this.findById(id);
  }

  delete(id: string): boolean {
    return this.database.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
  }
}
