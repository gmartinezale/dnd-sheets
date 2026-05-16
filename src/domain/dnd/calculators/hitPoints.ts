import { abilityModifier } from './abilityModifier';
import type { AbilityScores } from '../types/abilities';

/**
 * SRD 5.1 — Maximum hit points.
 * Level 1:   hit die max + CON modifier
 * Each subsequent level: average hit die roll + CON modifier
 *                        (average = floor(hitDie / 2) + 1)
 */
export function maxHitPoints(
  hitDie: number,
  level: number,
  abilityScores: AbilityScores,
  miscBonus: number = 0,
): number {
  if (level < 1) {
    throw new RangeError(`Level must be >= 1, got ${level}`);
  }
  const conMod = abilityModifier(abilityScores.CON);
  const level1HP = hitDie + conMod;
  if (level === 1) {
    return Math.max(1, level1HP + miscBonus);
  }
  const avgPerLevel = Math.floor(hitDie / 2) + 1;
  const additionalLevelsHP = (level - 1) * (avgPerLevel + conMod);
  return Math.max(level, level1HP + additionalLevelsHP + miscBonus);
}

/**
 * Number of hit dice a character has (equals character level).
 */
export function hitDiceTotal(level: number): number {
  return level;
}
