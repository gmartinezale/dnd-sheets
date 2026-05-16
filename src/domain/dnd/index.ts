// Domain public API — re-export everything from one place

// Types
export type { AbilityScores, AbilityModifiers, SavingThrowProficiencies, AbilityScoreEntry } from './types/abilities';
export type {
  Character,
  CharacterSummary,
  CharacterDraft,
  CreateCharacterInput,
  UpdateCharacterInput,
  SkillProficiencies,
} from './types/character';
export { CharacterSchema, DEFAULT_ABILITY_SCORES, DEFAULT_SAVING_THROW_PROFICIENCIES } from './types/character';
export type { Weapon, Armor, InventoryItem, CreateInventoryItemInput, AttackEntry, CharacterWeapon, CreateCharacterWeaponInput } from './types/equipment';
export { CharacterWeaponSchema } from './types/equipment';
export type { Spell, SpellSummary, CharacterSpell, CreateCharacterSpellInput, SpellSlotsByLevel, SpellSlotState } from './types/spells';
export type { ResourcePool, CreateResourcePoolInput, UpdateResourcePoolInput, RestType } from './types/resources';
export type { DndClass, DndClassSummary, DndRace, DndRaceSummary, CombatStats } from './types/classes';

// Calculators
export { abilityModifier } from './calculators/abilityModifier';
export { proficiencyBonus } from './calculators/proficiencyBonus';
export { skillBonus, allSkillBonuses } from './calculators/skills';
export { savingThrowBonus, allSavingThrowBonuses } from './calculators/savingThrows';
export { armorClass } from './calculators/armorClass';
export { weaponAttackBonus, weaponDamageBonus } from './calculators/weaponAttack';
export { spellSaveDC, spellAttackBonus } from './calculators/spellcasting';
export { maxHitPoints, hitDiceTotal } from './calculators/hitPoints';
export { getResettingResources, resetResource } from './calculators/resources';

// Rules
export { spellSlotsByClassAndLevel, CLASS_SPELLCASTING_TYPE, CLASS_SPELLCASTING_ABILITY, CLASS_HIT_DIE, CLASS_SAVING_THROWS } from './rules/spellSlotProgression';
export { sorceryPointsForLevel } from './rules/sorcererProgression';
export { featuresUpToLevel } from './rules/classProgression';
