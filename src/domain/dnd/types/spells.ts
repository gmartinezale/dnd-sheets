import { z } from 'zod';

export const SpellSchema = z.object({
  index: z.string(),
  name: z.string(),
  level: z.number().int().min(0).max(9),
  school: z.object({
    index: z.string(),
    name: z.string(),
  }),
  castingTime: z.string(),
  range: z.string(),
  duration: z.string(),
  concentration: z.boolean(),
  ritual: z.boolean(),
  components: z.array(z.enum(['V', 'S', 'M'])),
  material: z.string().optional(),
  description: z.array(z.string()),
  higherLevel: z.array(z.string()).optional(),
  classes: z.array(
    z.object({
      index: z.string(),
      name: z.string(),
    }),
  ),
  subclasses: z
    .array(
      z.object({
        index: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  url: z.string(),
});

export type Spell = z.infer<typeof SpellSchema>;

export type SpellSummary = Pick<
  Spell,
  'index' | 'name' | 'level' | 'school' | 'castingTime' | 'concentration' | 'ritual' | 'url'
>;

export const CharacterSpellSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  spellIndex: z.string(),
  spellName: z.string(),
  spellLevel: z.number().int().min(0).max(9),
  prepared: z.boolean().default(false),
  alwaysPrepared: z.boolean().default(false),
  createdAt: z.string().datetime(),
});

export type CharacterSpell = z.infer<typeof CharacterSpellSchema>;
export type CreateCharacterSpellInput = Omit<CharacterSpell, 'id' | 'createdAt'>;

/**
 * Spell slots by spell level (1-9).
 * 0 means no slots of that level.
 */
export type SpellSlotsByLevel = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
};

export type SpellSlotState = {
  slots: SpellSlotsByLevel;
  used: SpellSlotsByLevel;
};
