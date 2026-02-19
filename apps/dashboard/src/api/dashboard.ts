import { api } from './client';

export const dashboardApi = {
  getStats: () => api.get<{ data: any }>('/dashboard/stats'),
  getLiveData: () => api.get<{ data: any }>('/dashboard/live'),
};
