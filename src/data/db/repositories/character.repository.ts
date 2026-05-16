import * as Crypto from 'expo-crypto';
import type * as SQLite from 'expo-sqlite';
import { getDatabase } from '../database';
import { AppError } from '@/core/errors/AppError';
import type {
  Character,
  CharacterSummary,
  CreateCharacterInput,
  UpdateCharacterInput,
} from '@/domain/dnd/types/character';
import type { AbilityScores, SavingThrowProficiencies } from '@/domain/dnd/types/abilities';

// ─── Row type matching the SQLite schema ────────────────────────────────────

type CharacterRow = {
  id: string;
  name: string;
  race: string;
  subrace: string | null;
  character_class: string;
  subclass: string | null;
  level: number;
  background: string;
  alignment: string | null;
  experience_points: number;
  str: number; dex: number; con: number;
  int: number; wis: number; cha: number;
  save_str: number; save_dex: number; save_con: number;
  save_int: number; save_wis: number; save_cha: number;
  max_hp: number;
  current_hp: number;
  temp_hp: number;
  hit_dice_remaining: number;
  initiative_bonus: number | null;
  armor_class: number | null;
  shield_bonus: number;
  speed: number;
  spellcasting_ability: 'INT' | 'WIS' | 'CHA' | null;
  spell_attack_bonus: number | null;
  avatar_url: string | null;
  notes: string;
  extra_classes_json: string;
  created_at: string;
  updated_at: string;
};

// ─── Mappers ────────────────────────────────────────────────────────────────

function rowToCharacter(row: CharacterRow): Character {
  const abilityScores: AbilityScores = {
    STR: row.str, DEX: row.dex, CON: row.con,
    INT: row.int, WIS: row.wis, CHA: row.cha,
  };
  const savingThrowProficiencies: SavingThrowProficiencies = {
    STR: row.save_str === 1, DEX: row.save_dex === 1, CON: row.save_con === 1,
    INT: row.save_int === 1, WIS: row.save_wis === 1, CHA: row.save_cha === 1,
  };
  return {
    id: row.id,
    name: row.name,
    race: row.race,
    subrace: row.subrace,
    characterClass: row.character_class,
    subclass: row.subclass,
    level: row.level,
    background: row.background,
    alignment: row.alignment ?? undefined,
    experiencePoints: row.experience_points,
    abilityScores,
    savingThrowProficiencies,
    maxHitPoints: row.max_hp,
    currentHitPoints: row.current_hp,
    temporaryHitPoints: row.temp_hp,
    hitDiceRemaining: row.hit_dice_remaining,
    initiativeBonus: row.initiative_bonus,
    armorClass: row.armor_class,
    shieldBonus: row.shield_bonus,
    speed: row.speed,
    spellcastingAbility: row.spellcasting_ability,
    spellAttackBonus: row.spell_attack_bonus,
    avatarUrl: row.avatar_url,
    notes: row.notes,
    extraClasses: (() => {
      try {
        const parsed: unknown = JSON.parse(row.extra_classes_json || '[]');
        return Array.isArray(parsed) ? (parsed as Character['extraClasses']) : [];
      } catch {
        return [];
      }
    })(),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Repository ─────────────────────────────────────────────────────────────

function db(): SQLite.SQLiteDatabase {
  return getDatabase();
}

export const characterRepository = {
  async createCharacter(input: CreateCharacterInput): Promise<Character> {
    const id = Crypto.randomUUID();
    const now = new Date().toISOString();
    const { abilityScores: ab, savingThrowProficiencies: st } = input;

    await db().runAsync(
      `INSERT INTO characters (
        id, name, race, subrace, character_class, subclass, level, background,
        alignment, experience_points,
        str, dex, con, int, wis, cha,
        save_str, save_dex, save_con, save_int, save_wis, save_cha,
        max_hp, current_hp, temp_hp, hit_dice_remaining,
        initiative_bonus, armor_class, shield_bonus, speed,
        spellcasting_ability, spell_attack_bonus,
        avatar_url, notes, extra_classes_json, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?,
        ?, ?, ?, ?, ?
      )`,
      [
        id, input.name, input.race, input.subrace ?? null,
        input.characterClass, input.subclass ?? null, input.level, input.background,
        input.alignment ?? null, input.experiencePoints,
        ab.STR, ab.DEX, ab.CON, ab.INT, ab.WIS, ab.CHA,
        st.STR ? 1 : 0, st.DEX ? 1 : 0, st.CON ? 1 : 0,
        st.INT ? 1 : 0, st.WIS ? 1 : 0, st.CHA ? 1 : 0,
        input.maxHitPoints, input.currentHitPoints, input.temporaryHitPoints,
        input.hitDiceRemaining,
        input.initiativeBonus ?? null, input.armorClass ?? null,
        input.shieldBonus, input.speed,
        input.spellcastingAbility ?? null, input.spellAttackBonus ?? null,
        input.avatarUrl ?? null, input.notes,
        JSON.stringify(input.extraClasses ?? []),
        now, now,
      ],
    );

    const character = await this.getCharacterById(id);
    if (!character) {
      throw AppError.db('Failed to retrieve newly created character');
    }
    return character;
  },

  async getCharacterById(id: string): Promise<Character | null> {
    const row = await db().getFirstAsync<CharacterRow>(
      'SELECT * FROM characters WHERE id = ?',
      [id],
    );
    if (!row) {
      return null;
    }
    return rowToCharacter(row);
  },

  async listCharacters(): Promise<CharacterSummary[]> {
    const rows = await db().getAllAsync<CharacterRow>(
      `SELECT id, name, race, character_class, level,
              current_hp, max_hp, avatar_url, created_at, updated_at
       FROM characters
       ORDER BY updated_at DESC`,
    );
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      race: row.race,
      characterClass: row.character_class,
      level: row.level,
      currentHitPoints: row.current_hp,
      maxHitPoints: row.max_hp,
      avatarUrl: row.avatar_url,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async updateCharacter(id: string, input: UpdateCharacterInput): Promise<Character> {
    // Build update SET clause dynamically — only update provided fields
    const fieldMap: Record<string, unknown> = {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.race !== undefined && { race: input.race }),
      ...(input.subrace !== undefined && { subrace: input.subrace }),
      ...(input.characterClass !== undefined && { character_class: input.characterClass }),
      ...(input.subclass !== undefined && { subclass: input.subclass }),
      ...(input.level !== undefined && { level: input.level }),
      ...(input.background !== undefined && { background: input.background }),
      ...(input.alignment !== undefined && { alignment: input.alignment }),
      ...(input.experiencePoints !== undefined && { experience_points: input.experiencePoints }),
      ...(input.abilityScores !== undefined && {
        str: input.abilityScores.STR,
        dex: input.abilityScores.DEX,
        con: input.abilityScores.CON,
        int: input.abilityScores.INT,
        wis: input.abilityScores.WIS,
        cha: input.abilityScores.CHA,
      }),
      ...(input.savingThrowProficiencies !== undefined && {
        save_str: input.savingThrowProficiencies.STR ? 1 : 0,
        save_dex: input.savingThrowProficiencies.DEX ? 1 : 0,
        save_con: input.savingThrowProficiencies.CON ? 1 : 0,
        save_int: input.savingThrowProficiencies.INT ? 1 : 0,
        save_wis: input.savingThrowProficiencies.WIS ? 1 : 0,
        save_cha: input.savingThrowProficiencies.CHA ? 1 : 0,
      }),
      ...(input.maxHitPoints !== undefined && { max_hp: input.maxHitPoints }),
      ...(input.currentHitPoints !== undefined && { current_hp: input.currentHitPoints }),
      ...(input.temporaryHitPoints !== undefined && { temp_hp: input.temporaryHitPoints }),
      ...(input.hitDiceRemaining !== undefined && { hit_dice_remaining: input.hitDiceRemaining }),
      ...(input.initiativeBonus !== undefined && { initiative_bonus: input.initiativeBonus }),
      ...(input.armorClass !== undefined && { armor_class: input.armorClass }),
      ...(input.shieldBonus !== undefined && { shield_bonus: input.shieldBonus }),
      ...(input.speed !== undefined && { speed: input.speed }),
      ...(input.spellcastingAbility !== undefined && {
        spellcasting_ability: input.spellcastingAbility,
      }),
      ...(input.spellAttackBonus !== undefined && { spell_attack_bonus: input.spellAttackBonus }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.extraClasses !== undefined && {
        extra_classes_json: JSON.stringify(input.extraClasses),
      }),
      updated_at: input.updatedAt ?? new Date().toISOString(),
    };

    const entries = Object.entries(fieldMap);
    if (entries.length === 0) {
      const existing = await this.getCharacterById(id);
      if (!existing) {
        throw AppError.notFound('Character', id);
      }
      return existing;
    }

    const setClause = entries.map(([col]) => `${col} = ?`).join(', ');
    const values = [...entries.map(([, v]) => v), id];

    await db().runAsync(
      `UPDATE characters SET ${setClause} WHERE id = ?`,
      values as SQLite.SQLiteBindParams,
    );

    const updated = await this.getCharacterById(id);
    if (!updated) {
      throw AppError.notFound('Character', id);
    }
    return updated;
  },

  async deleteCharacter(id: string): Promise<void> {
    await db().runAsync('DELETE FROM characters WHERE id = ?', [id]);
  },
};
