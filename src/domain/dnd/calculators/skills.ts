import type { SkillName, ProficiencyType } from '@/core/constants/dnd.constants';
import { SKILL_ABILITY_MAP } from '@/core/constants/dnd.constants';
import { abilityModifier } from './abilityModifier';
import { proficiencyBonus } from './proficiencyBonus';
import type { AbilityScores } from '../types/abilities';
import type { SkillProficiencies } from '../types/character';

/**
 * SRD 5.1 — Skill check bonus.
 * full proficiency:  modifier + proficiencyBonus
 * half proficiency:  modifier + floor(proficiencyBonus / 2)  (Jack of All Trades)
 * expertise:         modifier + proficiencyBonus * 2
 * none:              modifier only
 */
export function skillBonus(
  skill: SkillName,
  abilityScores: AbilityScores,
  proficiency: ProficiencyType,
  level: number,
): number {
  const ability = SKILL_ABILITY_MAP[skill];
  const mod = abilityModifier(abilityScores[ability]);
  const prof = proficiencyBonus(level);

  switch (proficiency) {
    case 'full':
      return mod + prof;
    case 'half':
      return mod + Math.floor(prof / 2);
    case 'expertise':
      return mod + prof * 2;
    case 'none':
      return mod;
    default: {
      // Exhaustive check handled by TypeScript compiler
      const _exhaustive: never = proficiency;
      return _exhaustive;
    }
  }
}

/**
 * Computes all skill bonuses for a character.
 */
export function allSkillBonuses(
  abilityScores: AbilityScores,
  skillProficiencies: SkillProficiencies,
  level: number,
): Record<SkillName, number> {
  return Object.fromEntries(
    (Object.entries(skillProficiencies) as [SkillName, ProficiencyType][]).map(
      ([skill, proficiency]) => [skill, skillBonus(skill, abilityScores, proficiency, level)],
    ),
  ) as Record<SkillName, number>;
}
