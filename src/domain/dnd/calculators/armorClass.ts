import { abilityModifier } from './abilityModifier';
import type { AbilityScores } from '../types/abilities';
import type { Armor } from '../types/equipment';

/**
 * SRD 5.1 — Armor Class calculation.
 *
 * Unarmored:        10 + DEX modifier
 * Light Armor:      armor.base + DEX modifier
 * Medium Armor:     armor.base + min(DEX modifier, 2)
 * Heavy Armor:      armor.base (no DEX)
 * Shield:           +2 (added to any of the above)
 */
export function armorClass(
  abilityScores: AbilityScores,
  equippedArmor: Armor | null,
  shieldBonus: number,
  unarmoredACOverride: number | null = null,
): number {
  const dexMod = abilityModifier(abilityScores.DEX);

  if (unarmoredACOverride !== null) {
    return unarmoredACOverride + shieldBonus;
  }

  if (equippedArmor === null) {
    return 10 + dexMod + shieldBonus;
  }

  const { armorClass: ac } = equippedArmor;

  switch (equippedArmor.armorCategory) {
    case 'Light':
      return ac.base + dexMod + shieldBonus;
    case 'Medium': {
      const cappedDex = Math.min(dexMod, ac.maxBonus ?? 2);
      return ac.base + cappedDex + shieldBonus;
    }
    case 'Heavy':
      return ac.base + shieldBonus;
    case 'Shield':
      // Shield alone without base armor — just base unarmored + shield
      return 10 + dexMod + ac.base;
    default: {
      const _exhaustive: never = equippedArmor.armorCategory;
      return _exhaustive;
    }
  }
}
