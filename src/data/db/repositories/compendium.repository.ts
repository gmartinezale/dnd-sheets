import * as Crypto from 'expo-crypto';
import type * as SQLite from 'expo-sqlite';
import { getDatabase } from '../database';
import type { InventoryItem, CreateInventoryItemInput } from '@/domain/dnd/types/equipment';
import type { CharacterSpell, CreateCharacterSpellInput } from '@/domain/dnd/types/spells';
import type { ResourcePool, CreateResourcePoolInput, UpdateResourcePoolInput } from '@/domain/dnd/types/resources';
import type { SkillName, ProficiencyType } from '@/core/constants/dnd.constants';
import type { SkillProficiencies } from '@/domain/dnd/types/character';
import { SKILL_NAMES } from '@/core/constants/dnd.constants';

function db(): SQLite.SQLiteDatabase {
  return getDatabase();
}

// ─── Skill Proficiencies ─────────────────────────────────────────────────────

export const skillRepository = {
  async getSkillProficiencies(characterId: string): Promise<SkillProficiencies> {
    const rows = await db().getAllAsync<{ skill_name: string; proficiency_type: string }>(
      'SELECT skill_name, proficiency_type FROM character_skills WHERE character_id = ?',
      [characterId],
    );

    const map: Partial<Record<SkillName, ProficiencyType>> = {};
    for (const row of rows) {
      map[row.skill_name as SkillName] = row.proficiency_type as ProficiencyType;
    }

    // Fill in 'none' for any missing skills
    return Object.fromEntries(
      SKILL_NAMES.map((skill) => [skill, map[skill] ?? 'none']),
    ) as SkillProficiencies;
  },

  async setSkillProficiency(
    characterId: string,
    skill: SkillName,
    proficiency: ProficiencyType,
  ): Promise<void> {
    const id = Crypto.randomUUID();
    await db().runAsync(
      `INSERT INTO character_skills (id, character_id, skill_name, proficiency_type)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(character_id, skill_name) DO UPDATE SET proficiency_type = excluded.proficiency_type`,
      [id, characterId, skill, proficiency],
    );
  },

  async bulkSetSkillProficiencies(
    characterId: string,
    proficiencies: Partial<SkillProficiencies>,
  ): Promise<void> {
    for (const [skill, proficiency] of Object.entries(proficiencies)) {
      await this.setSkillProficiency(
        characterId,
        skill as SkillName,
        proficiency as ProficiencyType,
      );
    }
  },
};

// ─── Inventory ───────────────────────────────────────────────────────────────

export const inventoryRepository = {
  async getInventoryItems(characterId: string): Promise<InventoryItem[]> {
    const rows = await db().getAllAsync<{
      id: string; character_id: string; item_index: string; name: string;
      quantity: number; weight: number; equipped: number; item_type: string;
      notes: string; created_at: string;
    }>(
      'SELECT * FROM inventory_items WHERE character_id = ? ORDER BY name ASC',
      [characterId],
    );

    return rows.map((row) => ({
      id: row.id,
      characterId: row.character_id,
      itemIndex: row.item_index,
      name: row.name,
      quantity: row.quantity,
      weight: row.weight,
      equipped: row.equipped === 1,
      itemType: row.item_type as InventoryItem['itemType'],
      notes: row.notes,
      createdAt: row.created_at,
    }));
  },

  async addInventoryItem(input: CreateInventoryItemInput): Promise<InventoryItem> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db().runAsync(
      `INSERT INTO inventory_items
       (id, character_id, item_index, name, quantity, weight, equipped, item_type, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.characterId, input.itemIndex, input.name,
        input.quantity, input.weight, input.equipped ? 1 : 0,
        input.itemType, input.notes, now,
      ],
    );
    return { ...input, id, createdAt: now };
  },

  async updateInventoryItem(
    id: string,
    update: Partial<Omit<InventoryItem, 'id' | 'characterId' | 'createdAt'>>,
  ): Promise<void> {
    const fieldMap: Record<string, unknown> = {
      ...(update.name !== undefined && { name: update.name }),
      ...(update.quantity !== undefined && { quantity: update.quantity }),
      ...(update.weight !== undefined && { weight: update.weight }),
      ...(update.equipped !== undefined && { equipped: update.equipped ? 1 : 0 }),
      ...(update.notes !== undefined && { notes: update.notes }),
    };

    const entries = Object.entries(fieldMap);
    if (entries.length === 0) {
      return;
    }

    const setClause = entries.map(([col]) => `${col} = ?`).join(', ');
    await db().runAsync(
      `UPDATE inventory_items SET ${setClause} WHERE id = ?`,
      [...entries.map(([, v]) => v), id] as SQLite.SQLiteBindParams,
    );
  },

  async deleteInventoryItem(id: string): Promise<void> {
    await db().runAsync('DELETE FROM inventory_items WHERE id = ?', [id]);
  },
};

// ─── Spells ──────────────────────────────────────────────────────────────────

export const spellRepository = {
  async getCharacterSpells(characterId: string): Promise<CharacterSpell[]> {
    const rows = await db().getAllAsync<{
      id: string; character_id: string; spell_index: string; spell_name: string;
      spell_level: number; prepared: number; always_prepared: number; created_at: string;
    }>(
      'SELECT * FROM character_spells WHERE character_id = ? ORDER BY spell_level ASC, spell_name ASC',
      [characterId],
    );

    return rows.map((row) => ({
      id: row.id,
      characterId: row.character_id,
      spellIndex: row.spell_index,
      spellName: row.spell_name,
      spellLevel: row.spell_level,
      prepared: row.prepared === 1,
      alwaysPrepared: row.always_prepared === 1,
      createdAt: row.created_at,
    }));
  },

  async addCharacterSpell(input: CreateCharacterSpellInput): Promise<CharacterSpell> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db().runAsync(
      `INSERT INTO character_spells
       (id, character_id, spell_index, spell_name, spell_level, prepared, always_prepared, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.characterId, input.spellIndex, input.spellName,
        input.spellLevel, input.prepared ? 1 : 0, input.alwaysPrepared ? 1 : 0, now,
      ],
    );
    return { ...input, id, createdAt: now };
  },

  async toggleSpellPrepared(id: string, prepared: boolean): Promise<void> {
    await db().runAsync(
      'UPDATE character_spells SET prepared = ? WHERE id = ?',
      [prepared ? 1 : 0, id],
    );
  },

  async removeCharacterSpell(id: string): Promise<void> {
    await db().runAsync('DELETE FROM character_spells WHERE id = ?', [id]);
  },
};

// ─── Resource Pools ──────────────────────────────────────────────────────────

export const resourceRepository = {
  async getResourcePools(characterId: string): Promise<ResourcePool[]> {
    const rows = await db().getAllAsync<{
      id: string; character_id: string; resource_type: string; name: string;
      current: number; maximum: number; reset_on: string; notes: string;
      created_at: string; updated_at: string;
    }>(
      'SELECT * FROM resource_pools WHERE character_id = ? ORDER BY name ASC',
      [characterId],
    );

    return rows.map((row) => ({
      id: row.id,
      characterId: row.character_id,
      resourceType: row.resource_type as ResourcePool['resourceType'],
      name: row.name,
      current: row.current,
      maximum: row.maximum,
      resetOn: row.reset_on as ResourcePool['resetOn'],
      notes: row.notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async createResourcePool(input: CreateResourcePoolInput): Promise<ResourcePool> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db().runAsync(
      `INSERT INTO resource_pools
       (id, character_id, resource_type, name, current, maximum, reset_on, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.characterId, input.resourceType, input.name,
        input.current, input.maximum, input.resetOn, input.notes, now, now,
      ],
    );
    return { ...input, id, createdAt: now, updatedAt: now };
  },

  async updateResourcePool(id: string, input: UpdateResourcePoolInput): Promise<void> {
    const fieldMap: Record<string, unknown> = {
      ...(input.current !== undefined && { current: input.current }),
      ...(input.maximum !== undefined && { maximum: input.maximum }),
      ...(input.name !== undefined && { name: input.name }),
      ...(input.notes !== undefined && { notes: input.notes }),
      updated_at: input.updatedAt ?? new Date().toISOString(),
    };

    const entries = Object.entries(fieldMap);
    if (entries.length === 0) {
      return;
    }

    const setClause = entries.map(([col]) => `${col} = ?`).join(', ');
    await db().runAsync(
      `UPDATE resource_pools SET ${setClause} WHERE id = ?`,
      [...entries.map(([, v]) => v), id] as SQLite.SQLiteBindParams,
    );
  },

  async deleteResourcePool(id: string): Promise<void> {
    await db().runAsync('DELETE FROM resource_pools WHERE id = ?', [id]);
  },
};
