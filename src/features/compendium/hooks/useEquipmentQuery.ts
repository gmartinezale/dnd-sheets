import { useQuery } from '@tanstack/react-query';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';

export const equipmentQueryKeys = {
  all: ['equipment'] as const,
  lists: () => [...equipmentQueryKeys.all, 'list'] as const,
  details: () => [...equipmentQueryKeys.all, 'detail'] as const,
  detail: (index: string) => [...equipmentQueryKeys.details(), index] as const,
};

export function useEquipmentQuery() {
  return useQuery<Array<{ index: string; name: string }>, Error>({
    queryKey: equipmentQueryKeys.lists(),
    queryFn: () => dnd5eApiProvider.listEquipment(),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useEquipmentItemQuery(index: string) {
  return useQuery<unknown, Error>({
    queryKey: equipmentQueryKeys.detail(index),
    queryFn: () => dnd5eApiProvider.getEquipmentItem(index),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: index.length > 0,
  });
}
