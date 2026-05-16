import { z } from 'zod';
import type { AbilityScores, SavingThrowProficiencies } from './abilities';
import type { SkillName, ProficiencyType, Alignment } from '@/core/constants/dnd.constants';

export type SkillProficiencies = Record<SkillName, ProficiencyType>;

export const CharacterSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  race: z.string().min(1),
  subrace: z.string().nullable().optional(),
  characterClass: z.string().min(1),
  subclass: z.string().nullable().optional(),
  level: z.number().int().min(1).max(20),
  background: z.string().default(''),
  alignment: z.string().optional(),
  experiencePoints: z.number().int().min(0).default(0),

  // Ability scores
  abilityScores: z.object({
    STR: z.number().int().min(1).max(30),
    DEX: z.number().int().min(1).max(30),
    CON: z.number().int().min(1).max(30),
    INT: z.number().int().min(1).max(30),
    WIS: z.number().int().min(1).max(30),
    CHA: z.number().int().min(1).max(30),
  }),

  // Saving throw proficiencies
  savingThrowProficiencies: z.object({
    STR: z.boolean(),
    DEX: z.boolean(),
    CON: z.boolean(),
    INT: z.boolean(),
    WIS: z.boolean(),
    CHA: z.boolean(),
  }),

  // Combat
  maxHitPoints: z.number().int().min(1),
  currentHitPoints: z.number().int(),
  temporaryHitPoints: z.number().int().min(0).default(0),
  hitDiceRemaining: z.number().int().min(0),

  // Initiative override (null = use DEX modifier)
  initiativeBonus: z.number().int().nullable().default(null),

  // Armor
  armorClass: z.number().int().min(1).nullable().default(null),
  shieldBonus: z.number().int().min(0).default(0),

  // Speed in feet
  speed: z.number().int().min(0).default(30),

  // Spellcasting
  spellcastingAbility: z.enum(['INT', 'WIS', 'CHA']).nullable().default(null),
  spellAttackBonus: z.number().int().nullable().default(null),

  // Multiclass: extra classes beyond the primary
  extraClasses: z.array(
    z.object({
      characterClass: z.string(),
      level: z.number().int().min(1).max(20),
    }),
  ).default([]),

  // Meta
  avatarUrl: z.string().url().nullable().optional(),
  notes: z.string().default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Character = z.infer<typeof CharacterSchema>;

export type CharacterSummary = Pick<
  Character,
  | 'id'
  | 'name'
  | 'race'
  | 'characterClass'
  | 'level'
  | 'currentHitPoints'
  | 'maxHitPoints'
  | 'avatarUrl'
  | 'createdAt'
  | 'updatedAt'
>;

export type CreateCharacterInput = Omit<Character, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCharacterInput = Partial<Omit<Character, 'id' | 'createdAt'>>;

/** Draft state for the character creation wizard */
export type CharacterDraft = {
  step: 'name' | 'race' | 'class' | 'abilities' | 'review';
  name: string;
  race: string;
  subrace: string | null;
  characterClass: string;
  level: number;
  background: string;
  alignment: Alignment | null;
  abilityScores: AbilityScores;
  savingThrowProficiencies: SavingThrowProficiencies;
};

export const DEFAULT_ABILITY_SCORES: AbilityScores = {
  STR: 10,
  DEX: 10,
  CON: 10,
  INT: 10,
  WIS: 10,
  CHA: 10,
};

export const DEFAULT_SAVING_THROW_PROFICIENCIES: SavingThrowProficiencies = {
  STR: false,
  DEX: false,
  CON: false,
  INT: false,
  WIS: false,
  CHA: false,
};
