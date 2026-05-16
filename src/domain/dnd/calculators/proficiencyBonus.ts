import {
  PROFICIENCY_BONUS_BY_LEVEL,
  MIN_CHARACTER_LEVEL,
  MAX_CHARACTER_LEVEL,
} from '@/core/constants/dnd.constants';

/**
 * SRD 5.1 — Proficiency Bonus by character level.
 */
export function proficiencyBonus(level: number): number {
  if (level < MIN_CHARACTER_LEVEL || level > MAX_CHARACTER_LEVEL) {
    throw new RangeError(
      `Level must be between ${MIN_CHARACTER_LEVEL} and ${MAX_CHARACTER_LEVEL}, got ${level}`,
    );
  }
  const bonus = PROFICIENCY_BONUS_BY_LEVEL[level];
  if (bonus === undefined) {
    throw new RangeError(`No proficiency bonus defined for level ${level}`);
  }
  return bonus;
}
