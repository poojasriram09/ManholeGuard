import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';

export function useAlerts() {
  return useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getRecent,
    refetchInterval: 15000,
  });
}

export function useAlertSummary(from?: string, to?: string) {
  return useQuery({
    queryKey: ['alert-summary', from, to],
    queryFn: () => alertsApi.getSummary(from, to),
  });
}
