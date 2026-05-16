/**
 * D&D 5e Core Constants
 * Values sourced from the SRD 5.1 (Creative Commons Attribution 4.0)
 * https://dnd.wizards.com/resources/systems-reference-document
 */

export const ABILITY_NAMES = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'] as const;
export type AbilityName = (typeof ABILITY_NAMES)[number];

export const SKILL_NAMES = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
] as const;
export type SkillName = (typeof SKILL_NAMES)[number];

/** Maps each skill to its governing ability score */
export const SKILL_ABILITY_MAP: Record<SkillName, AbilityName> = {
  Acrobatics: 'DEX',
  'Animal Handling': 'WIS',
  Arcana: 'INT',
  Athletics: 'STR',
  Deception: 'CHA',
  History: 'INT',
  Insight: 'WIS',
  Intimidation: 'CHA',
  Investigation: 'INT',
  Medicine: 'WIS',
  Nature: 'INT',
  Perception: 'WIS',
  Performance: 'CHA',
  Persuasion: 'CHA',
  Religion: 'INT',
  'Sleight of Hand': 'DEX',
  Stealth: 'DEX',
  Survival: 'WIS',
};

/** SRD Proficiency bonus by character level */
export const PROFICIENCY_BONUS_BY_LEVEL: Record<number, number> = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6,
};

export const MIN_CHARACTER_LEVEL = 1;
export const MAX_CHARACTER_LEVEL = 20;
export const MIN_ABILITY_SCORE = 1;
export const MAX_ABILITY_SCORE = 30;

export const SRD_API_BASE_URL = 'https://www.dnd5eapi.co/api';

export const DND_CLASSES = [
  'barbarian',
  'bard',
  'cleric',
  'druid',
  'fighter',
  'monk',
  'paladin',
  'ranger',
  'rogue',
  'sorcerer',
  'warlock',
  'wizard',
] as const;
export type DndClass = (typeof DND_CLASSES)[number];

export const DND_RACES = [
  'dragonborn',
  'dwarf',
  'elf',
  'gnome',
  'half-elf',
  'half-orc',
  'halfling',
  'human',
  'tiefling',
] as const;
export type DndRace = (typeof DND_RACES)[number];

export const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
] as const;
export type Alignment = (typeof ALIGNMENTS)[number];

export const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const;
export type CreatureSize = (typeof SIZES)[number];

export const DAMAGE_TYPES = [
  'acid',
  'bludgeoning',
  'cold',
  'fire',
  'force',
  'lightning',
  'necrotic',
  'piercing',
  'poison',
  'psychic',
  'radiant',
  'slashing',
  'thunder',
] as const;
export type DamageType = (typeof DAMAGE_TYPES)[number];

export const WEAPON_CATEGORIES = ['Simple', 'Martial'] as const;
export const WEAPON_RANGES = ['Melee', 'Ranged'] as const;

export const SPELL_SCHOOLS = [
  'abjuration',
  'conjuration',
  'divination',
  'enchantment',
  'evocation',
  'illusion',
  'necromancy',
  'transmutation',
] as const;
export type SpellSchool = (typeof SPELL_SCHOOLS)[number];

export const PROFICIENCY_TYPES = ['none', 'half', 'full', 'expertise'] as const;
export type ProficiencyType = (typeof PROFICIENCY_TYPES)[number];
