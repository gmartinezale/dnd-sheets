import type { AbilityName } from '@/core/constants/dnd.constants';
import { abilityModifier } from './abilityModifier';
import { proficiencyBonus } from './proficiencyBonus';
import type { AbilityScores } from '../types/abilities';

type WeaponAttackProps = {
  /** True if the character has proficiency with this weapon */
  isProficient: boolean;
  /** Which ability score is used (STR for melee, DEX for ranged/finesse) */
  attackAbility: AbilityName;
  abilityScores: AbilityScores;
  characterLevel: number;
  /** Any fixed bonus (e.g., magic weapon bonus) */
  miscBonus?: number;
};

/**
 * SRD 5.1 — Weapon attack bonus.
 * = ability modifier + proficiency (if proficient) + misc bonus
 */
export function weaponAttackBonus({
  isProficient,
  attackAbility,
  abilityScores,
  characterLevel,
  miscBonus = 0,
}: WeaponAttackProps): number {
  const mod = abilityModifier(abilityScores[attackAbility]);
  const prof = isProficient ? proficiencyBonus(characterLevel) : 0;
  return mod + prof + miscBonus;
}

/**
 * SRD 5.1 — Weapon damage bonus.
 * = ability modifier + misc bonus
 * (proficiency does NOT add to damage)
 */
export function weaponDamageBonus(
  attackAbility: AbilityName,
  abilityScores: AbilityScores,
  miscBonus: number = 0,
): number {
  return abilityModifier(abilityScores[attackAbility]) + miscBonus;
}
