import { z } from 'zod';
import type { DamageType } from '@/core/constants/dnd.constants';

export const WeaponPropertySchema = z.object({
  index: z.string(),
  name: z.string(),
  url: z.string(),
});

export const WeaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  weaponCategory: z.enum(['Simple', 'Martial']),
  weaponRange: z.enum(['Melee', 'Ranged']),
  damageType: z.string(),
  damageDice: z.string(), // e.g. "1d8", "2d6"
  damageBonusOverride: z.number().int().nullable().default(null),
  properties: z.array(z.string()),
  weight: z.number().optional(),
  cost: z
    .object({
      quantity: z.number(),
      unit: z.string(),
    })
    .optional(),
  description: z.string().default(''),
});

export type Weapon = z.infer<typeof WeaponSchema>;

export const ArmorSchema = z.object({
  id: z.string(),
  name: z.string(),
  armorCategory: z.enum(['Light', 'Medium', 'Heavy', 'Shield']),
  armorClass: z.object({
    base: z.number().int(),
    dexBonus: z.boolean(),
    maxBonus: z.number().int().nullable(),
  }),
  strengthMinimum: z.number().int().default(0),
  stealthDisadvantage: z.boolean().default(false),
  weight: z.number().optional(),
  cost: z
    .object({
      quantity: z.number(),
      unit: z.string(),
    })
    .optional(),
});

export type Armor = z.infer<typeof ArmorSchema>;

export const InventoryItemSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  itemIndex: z.string(), // SRD index
  name: z.string(),
  quantity: z.number().int().min(0).default(1),
  weight: z.number().min(0).default(0),
  equipped: z.boolean().default(false),
  itemType: z.enum(['weapon', 'armor', 'gear', 'tool', 'magic', 'treasure', 'other']),
  notes: z.string().default(''),
  createdAt: z.string().datetime(),
});

export type InventoryItem = z.infer<typeof InventoryItemSchema>;
export type CreateInventoryItemInput = Omit<InventoryItem, 'id' | 'createdAt'>;

export type AttackEntry = {
  id: string;
  name: string;
  attackBonus: number;
  damageDice: string;
  damageBonus: number;
  damageType: DamageType;
  range: string;
  notes?: string;
};

export const CharacterWeaponSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  name: z.string().min(1),
  damageDice: z.string().min(1), // e.g. "1d8", "2d6"
  damageType: z.string().default('slashing'),
  attackAbility: z.enum(['STR', 'DEX']).default('STR'),
  isProficient: z.boolean().default(true),
  magicBonus: z.number().int().default(0),
  properties: z.array(z.string()).default([]),
  notes: z.string().default(''),
  source: z.enum(['srd', 'manual']).default('manual'),
  srdIndex: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
});

export type CharacterWeapon = z.infer<typeof CharacterWeaponSchema>;
export type CreateCharacterWeaponInput = Omit<CharacterWeapon, 'id' | 'createdAt'>;
