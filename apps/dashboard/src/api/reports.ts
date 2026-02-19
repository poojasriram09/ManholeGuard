import { api } from './client';

export const reportsApi = {
  generate: (params: Record<string, unknown>) => api.post<{ data: any }>('/reports', params),
  getById: (id: string) => api.get<{ data: any }>(`/reports/${id}`),
};
