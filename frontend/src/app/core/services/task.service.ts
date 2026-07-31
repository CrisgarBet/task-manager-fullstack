import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import type { CreateTaskInput, Task, TaskFilters, UpdateTaskInput } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/tasks`;

  getTasks(filters: TaskFilters = {}): Observable<Task[]> {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.search) params = params.set('search', filters.search);
    return this.http.get<Task[]>(this.url, { params });
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.url}/${id}`);
  }

  createTask(input: CreateTaskInput): Observable<Task> {
    return this.http.post<Task>(this.url, input);
  }

  updateTask(id: string, input: UpdateTaskInput): Observable<Task> {
    return this.http.put<Task>(`${this.url}/${id}`, input);
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
