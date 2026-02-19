import { api } from './client';

export const maintenanceApi = {
  getAll: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters);
    const qs = params.toString();
    return api.get<{ data: any[] }>(`/maintenance${qs ? `?${qs}` : ''}`);
  },
  create: (data: Record<string, unknown>) => api.post<{ data: any }>('/maintenance', data),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.put<{ data: any }>(`/maintenance/${id}/status`, { status, notes }),
  getOverdue: () => api.get<{ data: any[] }>('/maintenance/overdue'),
};
