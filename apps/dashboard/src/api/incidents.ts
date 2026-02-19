import { api } from './client';

export const incidentsApi = {
  getAll: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const qs = params.toString();
    return api.get<{ data: any[] }>(`/incidents${qs ? `?${qs}` : ''}`);
  },
  getById: (id: string) => api.get<{ data: any }>(`/incidents/${id}`),
  create: (data: Record<string, unknown>) => api.post<{ data: any }>('/incidents', data),
  resolve: (id: string, resolvedBy: string, notes?: string) =>
    api.put<{ data: any }>(`/incidents/${id}/resolve`, { resolvedBy, notes }),
};
