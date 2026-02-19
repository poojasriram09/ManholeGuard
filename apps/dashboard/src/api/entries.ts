import { api } from './client';

export const entriesApi = {
  getActive: () => api.get<{ data: any[] }>('/entry/active'),
  getById: (id: string) => api.get<{ data: any }>(`/entry/${id}`),
  getByWorker: (workerId: string) => api.get<{ data: any[] }>(`/entry/worker/${workerId}`),
};
