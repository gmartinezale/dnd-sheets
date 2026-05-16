import { useState, useCallback, useEffect } from 'react';
import { characterRepository } from '@/data/db/repositories/character.repository';
import type { CharacterSummary } from '@/domain/dnd/types/character';

type UseCharacterListReturn = {
  characters: CharacterSummary[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

// TODO: Replace with TanStack Query mutation + invalidation for reactive updates
export function useCharacterList(): UseCharacterListReturn {
  const [characters, setCharacters] = useState<CharacterSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await characterRepository.listCharacters();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    void load();
  }, [load]);

  return { characters, isLoading, error, refetch: load };
}
