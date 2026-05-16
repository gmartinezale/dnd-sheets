import { z } from 'zod';

export const ResourcePoolSchema = z.object({
  id: z.string().uuid(),
  characterId: z.string().uuid(),
  resourceType: z.enum([
    'hit_dice',
    'sorcery_points',
    'ki_points',
    'bardic_inspiration',
    'wild_shape',
    'channel_divinity',
    'lay_on_hands',
    'sneak_attack',
    'superiority_dice',
    'rages',
    'arcane_recovery',
    'natural_recovery',
    'second_wind',
    'action_surge',
    'indomitable',
    'custom',
  ]),
  name: z.string(),
  current: z.number().int().min(0),
  maximum: z.number().int().min(0),
  resetOn: z.enum(['short_rest', 'long_rest', 'dawn', 'never']).default('long_rest'),
  notes: z.string().default(''),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ResourcePool = z.infer<typeof ResourcePoolSchema>;
export type CreateResourcePoolInput = Omit<ResourcePool, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateResourcePoolInput = Partial<Omit<ResourcePool, 'id' | 'createdAt'>>;

export type RestType = 'short' | 'long';
