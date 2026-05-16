import type { AbilityName } from '@/core/constants/dnd.constants';
import { abilityModifier } from './abilityModifier';
import { proficiencyBonus } from './proficiencyBonus';
import type { AbilityScores, SavingThrowProficiencies } from '../types/abilities';

/**
 * SRD 5.1 — Saving throw bonus.
 * proficient:     modifier + proficiencyBonus
 * not proficient: modifier only
 */
export function savingThrowBonus(
  ability: AbilityName,
  abilityScores: AbilityScores,
  savingThrowProficiencies: SavingThrowProficiencies,
  level: number,
): number {
  const mod = abilityModifier(abilityScores[ability]);
  const isProficient = savingThrowProficiencies[ability];

  if (isProficient) {
    return mod + proficiencyBonus(level);
  }
  return mod;
}

/**
 * Computes all saving throw bonuses for a character.
 */
export function allSavingThrowBonuses(
  abilityScores: AbilityScores,
  savingThrowProficiencies: SavingThrowProficiencies,
  level: number,
): Record<AbilityName, number> {
  const abilities: AbilityName[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'];
  return Object.fromEntries(
    abilities.map((ability) => [
      ability,
      savingThrowBonus(ability, abilityScores, savingThrowProficiencies, level),
    ]),
  ) as Record<AbilityName, number>;
}
