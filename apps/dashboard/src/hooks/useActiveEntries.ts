import { useQuery } from '@tanstack/react-query';
import { entriesApi } from '../api/entries';

export function useActiveEntries() {
  return useQuery({
    queryKey: ['active-entries'],
    queryFn: entriesApi.getActive,
    refetchInterval: 10000,
  });
}

export function useEntry(id: string | undefined) {
  return useQuery({
    queryKey: ['entry', id],
    queryFn: () => entriesApi.getById(id!),
    enabled: !!id,
  });
}
