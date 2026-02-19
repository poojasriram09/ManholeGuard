import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useOverviewStats(from?: string, to?: string) {
  return useQuery({
    queryKey: ['overview-stats', from, to],
    queryFn: () => analyticsApi.getOverview(from, to),
  });
}

export function useWorkerPerformance(from?: string, to?: string) {
  return useQuery({
    queryKey: ['worker-performance', from, to],
    queryFn: () => analyticsApi.getWorkerPerformance(from, to),
  });
}
