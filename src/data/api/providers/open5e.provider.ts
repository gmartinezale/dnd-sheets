/**
 * Open5e provider stub.
 * TODO: Implement full Open5e API integration as an alternative provider.
 * Open5e API: https://api.open5e.com/
 *
 * This file exists to demonstrate the provider pattern — swap implementations
 * without changing consumers.
 */
import type { RulesProvider } from './providers.interface';
import type { Spell, SpellSummary } from '@/domain/dnd/types/spells';
import type { DndClass, DndRace } from '@/domain/dnd/types/classes';

class Open5eProvider implements RulesProvider {
  async listSpells(_filters?: { level?: number; school?: string; classIndex?: string }): Promise<SpellSummary[]> {
    throw new Error('Open5e provider not yet implemented. Use dnd5eApiProvider.');
  }

  async getSpell(_index: string): Promise<Spell> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async listMagicSchools(): Promise<Array<{ index: string; name: string }>> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async listClasses(): Promise<Array<{ index: string; name: string }>> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async getClass(_index: string): Promise<DndClass> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async listRaces(): Promise<Array<{ index: string; name: string }>> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async getRace(_index: string): Promise<DndRace> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async listEquipment(): Promise<Array<{ index: string; name: string }>> {
    throw new Error('Open5e provider not yet implemented.');
  }

  async getEquipmentItem(_index: string): Promise<unknown> {
    throw new Error('Open5e provider not yet implemented.');
  }
}

export const open5eProvider = new Open5eProvider();
