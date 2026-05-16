/**
 * SRD 5.1 — Spell slot progression by class and level.
 * Only full-casters, half-casters, and warlocks are included per SRD.
 *
 * NOTE: This data is derived from the SRD 5.1 (CC-BY 4.0).
 * Levels 1-20 for each spellcasting progression type.
 *
 * TODO: Add Paladin/Ranger (half-caster) slots
 */

export type SpellSlotTable = {
  [level: number]: { [slotLevel: number]: number };
};

/** Full caster progression (Wizard, Cleric, Druid, Bard, Sorcerer) */
const FULL_CASTER_SLOTS: SpellSlotTable = {
  1:  { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  2:  { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  3:  { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  4:  { 1: 4, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  5:  { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  6:  { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  7:  { 1: 4, 2: 3, 3: 3, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  8:  { 1: 4, 2: 3, 3: 3, 4: 2, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 0, 8: 0, 9: 0 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 0, 9: 0 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 0, 9: 0 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 0 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

/** Half-caster progression (Paladin, Ranger) - slots start at class level 2 */
const HALF_CASTER_SLOTS: SpellSlotTable = {
  1:  { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  2:  { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  3:  { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  4:  { 1: 3, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  5:  { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  6:  { 1: 4, 2: 2, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  7:  { 1: 4, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  8:  { 1: 4, 2: 3, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  9:  { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  10: { 1: 4, 2: 3, 3: 2, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  11: { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  12: { 1: 4, 2: 3, 3: 3, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  13: { 1: 4, 2: 3, 3: 3, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  14: { 1: 4, 2: 3, 3: 3, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  15: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  16: { 1: 4, 2: 3, 3: 3, 4: 2, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1, 6: 0, 7: 0, 8: 0, 9: 0 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 0, 7: 0, 8: 0, 9: 0 },
};

/** Warlock pact magic slots (all slots are same level, recover on short rest) */
const WARLOCK_SLOTS: SpellSlotTable = {
  1:  { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 },
  2:  { 1: 2, 2: 0, 3: 0, 4: 0, 5: 0 },
  3:  { 1: 0, 2: 2, 3: 0, 4: 0, 5: 0 },
  4:  { 1: 0, 2: 2, 3: 0, 4: 0, 5: 0 },
  5:  { 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 },
  6:  { 1: 0, 2: 0, 3: 2, 4: 0, 5: 0 },
  7:  { 1: 0, 2: 0, 3: 0, 4: 2, 5: 0 },
  8:  { 1: 0, 2: 0, 3: 0, 4: 2, 5: 0 },
  9:  { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 },
  10: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 2 },
  11: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  12: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  13: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  14: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  15: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  16: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 3 },
  17: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 },
  18: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 },
  19: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 },
  20: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 4 },
};

export type SpellcastingType = 'full' | 'half' | 'warlock' | 'none';

/** Map of SRD class index → spellcasting type */
export const CLASS_SPELLCASTING_TYPE: Record<string, SpellcastingType> = {
  bard: 'full',
  cleric: 'full',
  druid: 'full',
  sorcerer: 'full',
  wizard: 'full',
  paladin: 'half',
  ranger: 'half',
  warlock: 'warlock',
  barbarian: 'none',
  fighter: 'none',
  monk: 'none',
  rogue: 'none',
};

/** Map of SRD class index → spellcasting ability (null = non-caster) */
export const CLASS_SPELLCASTING_ABILITY: Record<string, 'INT' | 'WIS' | 'CHA' | null> = {
  bard: 'CHA',
  cleric: 'WIS',
  druid: 'WIS',
  sorcerer: 'CHA',
  wizard: 'INT',
  paladin: 'WIS',
  ranger: 'WIS',
  warlock: 'CHA',
  barbarian: null,
  fighter: null,
  monk: null,
  rogue: null,
};

/**
 * Returns the spell slot table for a given spellcasting type.
 */
export function getSpellSlotTable(type: SpellcastingType): SpellSlotTable {
  switch (type) {
    case 'full':
      return FULL_CASTER_SLOTS;
    case 'half':
      return HALF_CASTER_SLOTS;
    case 'warlock':
      return WARLOCK_SLOTS;
    case 'none':
      return {};
  }
}

/**
 * Returns spell slots for a given class and character level.
 * Returns null if the class is not a spellcaster.
 */
export function spellSlotsByClassAndLevel(
  classIndex: string,
  level: number,
): { [slotLevel: number]: number } | null {
  const type = CLASS_SPELLCASTING_TYPE[classIndex] ?? 'none';
  if (type === 'none') {
    return null;
  }
  const table = getSpellSlotTable(type);
  return table[level] ?? null;
}

/** SRD hit dice per class */
export const CLASS_HIT_DIE: Record<string, number> = {
  barbarian: 12,
  bard: 8,
  cleric: 8,
  druid: 8,
  fighter: 10,
  monk: 8,
  paladin: 10,
  ranger: 10,
  rogue: 8,
  sorcerer: 6,
  warlock: 8,
  wizard: 6,
};

/** SRD saving throw proficiencies per class */
export const CLASS_SAVING_THROWS: Record<string, [string, string]> = {
  barbarian: ['STR', 'CON'],
  bard: ['DEX', 'CHA'],
  cleric: ['WIS', 'CHA'],
  druid: ['INT', 'WIS'],
  fighter: ['STR', 'CON'],
  monk: ['STR', 'DEX'],
  paladin: ['WIS', 'CHA'],
  ranger: ['STR', 'DEX'],
  rogue: ['DEX', 'INT'],
  sorcerer: ['CON', 'CHA'],
  warlock: ['WIS', 'CHA'],
  wizard: ['INT', 'WIS'],
};
