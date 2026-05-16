import type * as SQLite from 'expo-sqlite';

/**
 * Migration 002 — Weapons & Multiclass
 * Adds character_weapons table and extra_classes_json column.
 */
export async function up(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS character_weapons (
      id              TEXT PRIMARY KEY NOT NULL,
      character_id    TEXT NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
      name            TEXT NOT NULL,
      damage_dice     TEXT NOT NULL DEFAULT '1d4',
      damage_type     TEXT NOT NULL DEFAULT 'slashing',
      attack_ability  TEXT NOT NULL DEFAULT 'STR' CHECK (attack_ability IN ('STR', 'DEX')),
      is_proficient   INTEGER NOT NULL DEFAULT 1 CHECK (is_proficient IN (0, 1)),
      magic_bonus     INTEGER NOT NULL DEFAULT 0,
      properties      TEXT NOT NULL DEFAULT '[]',
      notes           TEXT NOT NULL DEFAULT '',
      source          TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('srd', 'manual')),
      srd_index       TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_weapons_character ON character_weapons(character_id);
  `);

  // ALTER TABLE is not transactional in SQLite — use separate exec
  // Use IF NOT EXISTS via a guard to be idempotent
  const cols = await db.getAllAsync<{ name: string }>(
    "PRAGMA table_info(characters)",
  );
  const hasExtraClasses = cols.some((c) => c.name === 'extra_classes_json');
  if (!hasExtraClasses) {
    await db.execAsync(
      `ALTER TABLE characters ADD COLUMN extra_classes_json TEXT NOT NULL DEFAULT '[]';`,
    );
  }
}
