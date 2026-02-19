import { api } from './client';

export const tasksApi = {
  getAll: () => api.get<{ data: any[] }>('/tasks'),
  getById: (id: string) => api.get<{ data: any }>(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => api.post<{ data: any }>('/tasks', data),
  update: (id: string, data: Record<string, unknown>) => api.put<{ data: any }>(`/tasks/${id}`, data),
  complete: (id: string) => api.put<{ data: any }>(`/tasks/${id}/complete`, {}),
};
