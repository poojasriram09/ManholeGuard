import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL = 15000;

const REALTIME_QUERY_KEYS = [
  ['active-entries'],
  ['alerts'],
  ['manholes'],
] as const;

export function useRealtimeUpdates() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const interval = setInterval(() => {
      for (const key of REALTIME_QUERY_KEYS) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [queryClient]);
}
