import type { AbilityName } from '@/core/constants/dnd.constants';
import { abilityModifier } from './abilityModifier';
import { proficiencyBonus } from './proficiencyBonus';
import type { AbilityScores } from '../types/abilities';

type SpellcastingProps = {
  spellcastingAbility: AbilityName;
  abilityScores: AbilityScores;
  characterLevel: number;
  miscBonus?: number;
};

/**
 * SRD 5.1 — Spell save DC.
 * = 8 + proficiency bonus + spellcasting ability modifier + misc bonus
 */
export function spellSaveDC({
  spellcastingAbility,
  abilityScores,
  characterLevel,
  miscBonus = 0,
}: SpellcastingProps): number {
  const mod = abilityModifier(abilityScores[spellcastingAbility]);
  const prof = proficiencyBonus(characterLevel);
  return 8 + prof + mod + miscBonus;
}

/**
 * SRD 5.1 — Spell attack bonus.
 * = proficiency bonus + spellcasting ability modifier + misc bonus
 */
export function spellAttackBonus({
  spellcastingAbility,
  abilityScores,
  characterLevel,
  miscBonus = 0,
}: SpellcastingProps): number {
  const mod = abilityModifier(abilityScores[spellcastingAbility]);
  const prof = proficiencyBonus(characterLevel);
  return prof + mod + miscBonus;
}
