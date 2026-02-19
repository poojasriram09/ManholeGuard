import { api } from './client';

function buildDateQuery(from?: string, to?: string): string {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const analyticsApi = {
  getOverview: (from?: string, to?: string) =>
    api.get<{ data: any }>(`/analytics/overview${buildDateQuery(from, to)}`),
  getWorkerPerformance: (from?: string, to?: string) =>
    api.get<{ data: any[] }>(`/analytics/worker-performance${buildDateQuery(from, to)}`),
};
