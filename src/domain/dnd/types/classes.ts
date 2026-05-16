import { z } from 'zod';

export const DndClassSchema = z.object({
  index: z.string(),
  name: z.string(),
  hitDie: z.number().int(),
  proficiencyChoices: z.array(z.unknown()).optional(),
  proficiencies: z.array(z.object({ index: z.string(), name: z.string() })),
  savingThrows: z.array(z.object({ index: z.string(), name: z.string() })),
  startingEquipment: z.array(z.unknown()).optional(),
  subclasses: z.array(z.object({ index: z.string(), name: z.string() })),
  spellcasting: z
    .object({
      level: z.number(),
      spellcastingAbility: z.object({ index: z.string(), name: z.string() }),
    })
    .nullable()
    .optional(),
  url: z.string(),
});

export type DndClass = z.infer<typeof DndClassSchema>;
export type DndClassSummary = Pick<DndClass, 'index' | 'name' | 'hitDie'>;

export const DndRaceSchema = z.object({
  index: z.string(),
  name: z.string(),
  speed: z.number().int(),
  abilityBonuses: z.array(
    z.object({
      abilityScore: z.object({ index: z.string(), name: z.string() }),
      bonus: z.number().int(),
    }),
  ),
  size: z.string(),
  sizeDescription: z.string().optional(),
  languages: z.array(z.object({ index: z.string(), name: z.string() })),
  traits: z.array(z.object({ index: z.string(), name: z.string() })).optional(),
  subraces: z.array(z.object({ index: z.string(), name: z.string() })).optional(),
  url: z.string(),
});

export type DndRace = z.infer<typeof DndRaceSchema>;
export type DndRaceSummary = Pick<DndRace, 'index' | 'name' | 'speed'>;

export type CombatStats = {
  armorClass: number;
  initiative: number;
  speed: number;
  proficiencyBonus: number;
  maxHitPoints: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
};
