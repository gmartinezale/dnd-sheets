import { useQuery } from '@tanstack/react-query';
import { dnd5eApiProvider } from '@/data/api/providers/dnd5eApi.provider';
import type { SpellSummary, Spell } from '@/domain/dnd/types/spells';

export const spellQueryKeys = {
  all: ['spells'] as const,
  lists: () => [...spellQueryKeys.all, 'list'] as const,
  list: (filters: { level?: number; classIndex?: string }) =>
    [...spellQueryKeys.lists(), filters] as const,
  details: () => [...spellQueryKeys.all, 'detail'] as const,
  detail: (index: string) => [...spellQueryKeys.details(), index] as const,
};

export function useSpellsQuery(filters: { level?: number; classIndex?: string } = {}) {
  return useQuery<SpellSummary[], Error>({
    queryKey: spellQueryKeys.list(filters),
    queryFn: () => dnd5eApiProvider.listSpells(filters),
    staleTime: 1000 * 60 * 60, // 1 hour — SRD data rarely changes
  });
}

export function useSpellQuery(index: string) {
  return useQuery<Spell, Error>({
    queryKey: spellQueryKeys.detail(index),
    queryFn: () => dnd5eApiProvider.getSpell(index),
    staleTime: 1000 * 60 * 60,
    enabled: index.length > 0,
  });
}
