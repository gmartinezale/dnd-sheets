import { MIN_ABILITY_SCORE, MAX_ABILITY_SCORE } from '@/core/constants/dnd.constants';

/**
 * SRD 5.1 — Ability Score Modifier
 * modifier = floor((score - 10) / 2)
 */
export function abilityModifier(score: number): number {
  if (score < MIN_ABILITY_SCORE || score > MAX_ABILITY_SCORE) {
    throw new RangeError(
      `Ability score must be between ${MIN_ABILITY_SCORE} and ${MAX_ABILITY_SCORE}, got ${score}`,
    );
  }
  return Math.floor((score - 10) / 2);
}
