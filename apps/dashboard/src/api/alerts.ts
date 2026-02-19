import { api } from './client';

export const alertsApi = {
  getRecent: () => api.get<{ data: any[] }>('/alerts/recent'),
  getByEntry: (entryId: string) => api.get<{ data: any[] }>(`/alerts/entry/${entryId}`),
  acknowledge: (alertId: string) => api.put<{ data: any }>(`/alerts/${alertId}/acknowledge`, {}),
  getSummary: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString();
    return api.get<{ data: any }>(`/alerts/summary${qs ? `?${qs}` : ''}`);
  },
};
