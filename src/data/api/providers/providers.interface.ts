import type { Spell, SpellSummary } from '@/domain/dnd/types/spells';
import type { DndClass } from '@/domain/dnd/types/classes';
import type { DndRace } from '@/domain/dnd/types/classes';

/**
 * Abstract provider interfaces.
 * Swap implementations (dnd5eApi, open5e, etc.) without changing consumers.
 */

export interface SpellProvider {
  listSpells(filters?: { level?: number; school?: string; classIndex?: string }): Promise<SpellSummary[]>;
  getSpell(index: string): Promise<Spell>;
  listMagicSchools(): Promise<Array<{ index: string; name: string }>>;
}

export interface ClassProvider {
  listClasses(): Promise<Array<{ index: string; name: string }>>;
  getClass(index: string): Promise<DndClass>;
}

export interface RaceProvider {
  listRaces(): Promise<Array<{ index: string; name: string }>>;
  getRace(index: string): Promise<DndRace>;
}

export interface EquipmentProvider {
  listEquipment(): Promise<Array<{ index: string; name: string }>>;
  getEquipmentItem(index: string): Promise<unknown>;
}

export interface RulesProvider
  extends SpellProvider,
    ClassProvider,
    RaceProvider,
    EquipmentProvider {}
