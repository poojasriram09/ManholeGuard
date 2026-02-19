import { api } from './client';

export const shiftsApi = {
  getActive: () => api.get<{ data: any[] }>('/shifts/active'),
  getByWorker: (workerId: string) => api.get<{ data: any[] }>(`/shifts/worker/${workerId}`),
  start: (workerId: string) => api.post<{ data: any }>('/shifts', { workerId }),
  end: (shiftId: string) => api.put<{ data: any }>(`/shifts/${shiftId}/end`, {}),
};
