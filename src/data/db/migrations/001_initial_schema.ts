import type * as SQLite from 'expo-sqlite';

/**
 * Migration 001 — Initial schema
 * Creates all core tables for the DnD Sheets app.
 * All queries use parameterized statements to prevent SQL injection.
 */
export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS characters (
      id          TEXT PRIMARY KEY NOT NULL,
      name        TEXT NOT NULL,
      race        TEXT NOT NULL DEFAULT '',
      subrace     TEXT,
      character_class TEXT NOT NULL DEFAULT '',
      subclass    TEXT,
      level       INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
      background  TEXT NOT NULL DEFAULT '',
      alignment   TEXT,
      experience_points INTEGER NOT NULL DEFAULT 0 CHECK (experience_points >= 0),

      str         INTEGER NOT NULL DEFAULT 10 CHECK (str >= 1 AND str <= 30),
      dex         INTEGER NOT NULL DEFAULT 10 CHECK (dex >= 1 AND dex <= 30),
      con         INTEGER NOT NULL DEFAULT 10 CHECK (con >= 1 AND con <= 30),
      int         INTEGER NOT NULL DEFAULT 10 CHECK (int >= 1 AND int <= 30),
      wis         INTEGER NOT NULL DEFAULT 10 CHECK (wis >= 1 AND wis <= 30),
      cha         INTEGER NOT NULL DEFAULT 10 CHECK (cha >= 1 AND cha <= 30),

      save_str    INTEGER NOT NULL DEFAULT 0 CHECK (save_str IN (0, 1)),
      save_dex    INTEGER NOT NULL DEFAULT 0 CHECK (save_dex IN (0, 1)),
      save_con    INTEGER NOT NULL DEFAULT 0 CHECK (save_con IN (0, 1)),
      save_int    INTEGER NOT NULL DEFAULT 0 CHECK (save_int IN (0, 1)),
      save_wis    INTEGER NOT NULL DEFAULT 0 CHECK (save_wis IN (0, 1)),
      save_cha    INTEGER NOT NULL DEFAULT 0 CHECK (save_cha IN (0, 1)),

      max_hp      INTEGER NOT NULL DEFAULT 1 CHECK (max_hp >= 1),
      current_hp  INTEGER NOT NULL DEFAULT 1,
      temp_hp     INTEGER NOT NULL DEFAULT 0 CHECK (temp_hp >= 0),
      hit_dice_remaining INTEGER NOT NULL DEFAULT 1 CHECK (hit_dice_remaining >= 0),

      initiative_bonus INTEGER,
      armor_class      INTEGER,
      shield_bonus     INTEGER NOT NULL DEFAULT 0,
      speed            INTEGER NOT NULL DEFAULT 30 CHECK (speed >= 0),

      spellcasting_ability TEXT CHECK (spellcasting_ability IN ('INT', 'WIS', 'CHA') OR spellcasting_ability IS NULL),
      spell_attack_bonus   INTEGER,

      avatar_url  TEXT,
      notes       TEXT NOT NULL DEFAULT '',

      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_skills (
      id              TEXT PRIMARY KEY NOT NULL,
      character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      skill_name      TEXT NOT NULL,
      proficiency_type TEXT NOT NULL DEFAULT 'none' CHECK (proficiency_type IN ('none', 'half', 'full', 'expertise')),
      UNIQUE (character_id, skill_name)
    );

    CREATE TABLE IF NOT EXISTS inventory_items (
      id              TEXT PRIMARY KEY NOT NULL,
      character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      item_index      TEXT NOT NULL,
      name            TEXT NOT NULL,
      quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
      weight          REAL NOT NULL DEFAULT 0,
      equipped        INTEGER NOT NULL DEFAULT 0 CHECK (equipped IN (0, 1)),
      item_type       TEXT NOT NULL DEFAULT 'other',
      notes           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS character_spells (
      id              TEXT PRIMARY KEY NOT NULL,
      character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      spell_index     TEXT NOT NULL,
      spell_name      TEXT NOT NULL,
      spell_level     INTEGER NOT NULL CHECK (spell_level >= 0 AND spell_level <= 9),
      prepared        INTEGER NOT NULL DEFAULT 0 CHECK (prepared IN (0, 1)),
      always_prepared INTEGER NOT NULL DEFAULT 0 CHECK (always_prepared IN (0, 1)),
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (character_id, spell_index)
    );

    CREATE TABLE IF NOT EXISTS resource_pools (
      id              TEXT PRIMARY KEY NOT NULL,
      character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      resource_type   TEXT NOT NULL,
      name            TEXT NOT NULL,
      current         INTEGER NOT NULL DEFAULT 0 CHECK (current >= 0),
      maximum         INTEGER NOT NULL DEFAULT 0 CHECK (maximum >= 0),
      reset_on        TEXT NOT NULL DEFAULT 'long_rest' CHECK (reset_on IN ('short_rest', 'long_rest', 'dawn', 'never')),
      notes           TEXT NOT NULL DEFAULT '',
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_characters_updated ON characters(updated_at DESC);
    CREATE INDEX IF NOT EXISTS idx_skills_character ON character_skills(character_id);
    CREATE INDEX IF NOT EXISTS idx_items_character ON inventory_items(character_id);
    CREATE INDEX IF NOT EXISTS idx_spells_character ON character_spells(character_id);
    CREATE INDEX IF NOT EXISTS idx_spells_level ON character_spells(character_id, spell_level);
    CREATE INDEX IF NOT EXISTS idx_resources_character ON resource_pools(character_id);
  `);
}
