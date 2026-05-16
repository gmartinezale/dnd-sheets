import { useQuery } from '@tanstack/react-query';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';
import type { DndClass } from '@/domain/dnd/types/classes';

export const classQueryKeys = {
  all: ['classes'] as const,
  lists: () => [...classQueryKeys.all, 'list'] as const,
  details: () => [...classQueryKeys.all, 'detail'] as const,
  detail: (index: string) => [...classQueryKeys.details(), index] as const,
};

export function useClassesQuery() {
  return useQuery<Array<{ index: string; name: string }>, Error>({
    queryKey: classQueryKeys.lists(),
    queryFn: () => dnd5eApiProvider.listClasses(),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

export function useClassQuery(index: string) {
  return useQuery<DndClass, Error>({
    queryKey: classQueryKeys.detail(index),
    queryFn: () => dnd5eApiProvider.getClass(index),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: index.length > 0,
  });
}
