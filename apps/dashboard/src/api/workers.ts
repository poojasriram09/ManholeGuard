import { api } from './client';

export const workersApi = {
  getAll: () => api.get<{ data: any[] }>('/workers'),
  getById: (id: string) => api.get<{ data: any }>(`/workers/${id}`),
  create: (data: Record<string, unknown>) => api.post<{ data: any }>('/workers', data),
  update: (id: string, data: Record<string, unknown>) => api.put<{ data: any }>(`/workers/${id}`, data),
  delete: (id: string) => api.delete<{ data: any }>(`/workers/${id}`),
};
