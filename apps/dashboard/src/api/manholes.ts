import { api } from './client';

export const manholesApi = {
  getAll: () => api.get<{ data: any[] }>('/manholes'),
  getById: (id: string) => api.get<{ data: any }>(`/manholes/${id}`),
  create: (data: Record<string, unknown>) => api.post<{ data: any }>('/manholes', data),
  update: (id: string, data: Record<string, unknown>) => api.put<{ data: any }>(`/manholes/${id}`, data),
  delete: (id: string) => api.delete<{ data: any }>(`/manholes/${id}`),
  getRisk: (id: string) => api.get<{ data: any }>(`/manholes/${id}/risk`),
  recalculateRisk: (id: string) => api.post<{ data: any }>(`/manholes/${id}/risk/recalculate`, {}),
};
