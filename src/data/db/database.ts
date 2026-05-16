import * as SQLite from 'expo-sqlite';
import { AppError } from '@/core/errors/AppError';

let _db: SQLite.SQLiteDatabase | null = null;

/**
 * Returns the singleton SQLite database instance.
 * Opens the database if not already open.
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (_db === null) {
    _db = SQLite.openDatabaseSync('dnd_sheets.db');
  }
  return _db;
}

/**
 * Runs all migrations in order.
 * Safe to call on every app start (migrations are idempotent).
 */
export async function runMigrations(): Promise<void> {
  const db = getDatabase();
  try {
    await import('./migrations/001_initial_schema').then(({ up }) => up(db));
    await import('./migrations/002_weapons_multiclass').then(({ up }) => up(db));
  } catch (err) {
    throw AppError.db('Failed to run database migrations', err);
  }
}
