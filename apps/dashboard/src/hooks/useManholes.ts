import { useQuery } from '@tanstack/react-query';
import { manholesApi } from '../api/manholes';

export function useManholes() {
  return useQuery({
    queryKey: ['manholes'],
    queryFn: manholesApi.getAll,
    refetchInterval: 60000,
  });
}

export function useManhole(id: string | undefined) {
  return useQuery({
    queryKey: ['manhole', id],
    queryFn: () => manholesApi.getById(id!),
    enabled: !!id,
  });
}
