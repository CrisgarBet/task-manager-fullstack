export type TaskStatus = 'pending' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TaskInput {
  title: string;
  description: string | null;
  status: TaskStatus;
}

export type CreateTaskInput = TaskInput;
export type UpdateTaskInput = TaskInput;

export interface TaskFilters {
  status?: TaskStatus;
  search?: string;
}
