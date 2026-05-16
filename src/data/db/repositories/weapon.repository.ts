import * as Crypto from 'expo-crypto';
import { getDatabase } from '../database';
import type { CharacterWeapon, CreateCharacterWeaponInput } from '@/domain/dnd/types/equipment';

function db() {
  return getDatabase();
}

type WeaponRow = {
  id: string;
  character_id: string;
  name: string;
  damage_dice: string;
  damage_type: string;
  attack_ability: string;
  is_proficient: number;
  magic_bonus: number;
  properties: string;
  notes: string;
  source: string;
  srd_index: string | null;
  created_at: string;
};

function rowToWeapon(row: WeaponRow): CharacterWeapon {
  return {
    id: row.id,
    characterId: row.character_id,
    name: row.name,
    damageDice: row.damage_dice,
    damageType: row.damage_type,
    attackAbility: row.attack_ability as 'STR' | 'DEX',
    isProficient: row.is_proficient === 1,
    magicBonus: row.magic_bonus,
    properties: (() => {
      try {
        const p: unknown = JSON.parse(row.properties);
        return Array.isArray(p) ? (p as string[]) : [];
      } catch {
        return [];
      }
    })(),
    notes: row.notes,
    source: row.source as 'srd' | 'manual',
    srdIndex: row.srd_index,
    createdAt: row.created_at,
  };
}

export const weaponRepository = {
  async getWeapons(characterId: string): Promise<CharacterWeapon[]> {
    const rows = await db().getAllAsync<WeaponRow>(
      'SELECT * FROM character_weapons WHERE character_id = ? ORDER BY name ASC',
      [characterId],
    );
    return rows.map(rowToWeapon);
  },

  async addWeapon(input: CreateCharacterWeaponInput): Promise<CharacterWeapon> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    await db().runAsync(
      `INSERT INTO character_weapons
       (id, character_id, name, damage_dice, damage_type, attack_ability,
        is_proficient, magic_bonus, properties, notes, source, srd_index, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, input.characterId, input.name, input.damageDice, input.damageType,
        input.attackAbility, input.isProficient ? 1 : 0, input.magicBonus,
        JSON.stringify(input.properties), input.notes, input.source,
        input.srdIndex ?? null, now,
      ],
    );
    return { ...input, id, createdAt: now };
  },

  async deleteWeapon(id: string): Promise<void> {
    await db().runAsync('DELETE FROM character_weapons WHERE id = ?', [id]);
  },
};
