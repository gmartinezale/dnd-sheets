import { z } from 'zod';

// ─── Spell DTO ───────────────────────────────────────────────────────────────

export const SpellListItemDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  url: z.string(),
});

export const SpellListDtoSchema = z.object({
  count: z.number(),
  results: z.array(SpellListItemDtoSchema),
});

export const SpellDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  desc: z.array(z.string()),
  higher_level: z.array(z.string()).optional().default([]),
  range: z.string(),
  components: z.array(z.enum(['V', 'S', 'M'])),
  material: z.string().optional(),
  ritual: z.boolean(),
  duration: z.string(),
  concentration: z.boolean(),
  casting_time: z.string(),
  level: z.number().int().min(0).max(9),
  school: z.object({ index: z.string(), name: z.string(), url: z.string() }),
  classes: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
  subclasses: z
    .array(z.object({ index: z.string(), name: z.string(), url: z.string() }))
    .optional()
    .default([]),
  url: z.string(),
});

export type SpellDto = z.infer<typeof SpellDtoSchema>;
export type SpellListDto = z.infer<typeof SpellListDtoSchema>;

// ─── Class DTO ───────────────────────────────────────────────────────────────

export const ClassListItemDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  url: z.string(),
});

export const ClassDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  hit_die: z.number().int(),
  proficiency_choices: z.array(z.unknown()).optional().default([]),
  proficiencies: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
  saving_throws: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
  starting_equipment: z.array(z.unknown()).optional().default([]),
  subclasses: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
  spellcasting: z
    .object({
      level: z.number(),
      spellcasting_ability: z.object({ index: z.string(), name: z.string() }),
    })
    .nullable()
    .optional(),
  url: z.string(),
});

export type ClassDto = z.infer<typeof ClassDtoSchema>;

// ─── Race DTO ────────────────────────────────────────────────────────────────

export const RaceDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  speed: z.number().int(),
  ability_bonuses: z.array(
    z.object({
      ability_score: z.object({ index: z.string(), name: z.string() }),
      bonus: z.number().int(),
    }),
  ),
  size: z.string(),
  size_description: z.string().optional().default(''),
  languages: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
  traits: z
    .array(z.object({ index: z.string(), name: z.string(), url: z.string() }))
    .optional()
    .default([]),
  subraces: z
    .array(z.object({ index: z.string(), name: z.string(), url: z.string() }))
    .optional()
    .default([]),
  url: z.string(),
});

export type RaceDto = z.infer<typeof RaceDtoSchema>;

// ─── Equipment DTO ───────────────────────────────────────────────────────────

export const EquipmentListItemDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  url: z.string(),
});

export const EquipmentListDtoSchema = z.object({
  count: z.number(),
  results: z.array(EquipmentListItemDtoSchema),
});

export type EquipmentListDto = z.infer<typeof EquipmentListDtoSchema>;

// ─── Equipment detail DTO ────────────────────────────────────────────────────

export const EquipmentDetailDtoSchema = z.object({
  index: z.string(),
  name: z.string(),
  equipment_category: z.object({ index: z.string(), name: z.string() }),
  weapon_category: z.string().optional(),
  weapon_range: z.string().optional(),
  damage: z
    .object({
      damage_dice: z.string(),
      damage_type: z.object({ index: z.string(), name: z.string() }),
    })
    .optional(),
  two_handed_damage: z
    .object({
      damage_dice: z.string(),
      damage_type: z.object({ index: z.string(), name: z.string() }),
    })
    .optional(),
  properties: z
    .array(z.object({ index: z.string(), name: z.string(), url: z.string() }))
    .optional()
    .default([]),
  url: z.string(),
});

export type EquipmentDetailDto = z.infer<typeof EquipmentDetailDtoSchema>;

// ─── Generic list DTO ────────────────────────────────────────────────────────

export const GenericListDtoSchema = z.object({
  count: z.number(),
  results: z.array(z.object({ index: z.string(), name: z.string(), url: z.string() })),
});

export type GenericListDto = z.infer<typeof GenericListDtoSchema>;
