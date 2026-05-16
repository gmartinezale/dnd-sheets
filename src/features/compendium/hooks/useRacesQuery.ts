import { useQuery } from '@tanstack/react-query';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';
import type { DndRace } from '@/domain/dnd/types/classes';

export const raceQueryKeys = {
  all: ['races'] as const,
  lists: () => [...raceQueryKeys.all, 'list'] as const,
  details: () => [...raceQueryKeys.all, 'detail'] as const,
  detail: (index: string) => [...raceQueryKeys.details(), index] as const,
};

export function useRacesQuery() {
  return useQuery<Array<{ index: string; name: string }>, Error>({
    queryKey: raceQueryKeys.lists(),
    queryFn: () => dnd5eApiProvider.listRaces(),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useRaceQuery(index: string) {
  return useQuery<DndRace, Error>({
    queryKey: raceQueryKeys.detail(index),
    queryFn: () => dnd5eApiProvider.getRace(index),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: index.length > 0,
  });
}
