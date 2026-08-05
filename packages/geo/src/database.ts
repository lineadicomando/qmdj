import { existsSync, readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { GeoError } from './types.js';

/**
 * Loads the shared SQL schema.
 *
 * Single source in `schema.sql` at the package root: the import script reads
 * the same file, so the two copies cannot drift apart.
 */
export function loadSchema(): string {
  return readFileSync(fileURLToPath(new URL('../schema.sql', import.meta.url)), 'utf8');
}

export function defaultDatabasePath(): string {
  return (
    process.env['GEONAMES_DB_PATH'] ?? fileURLToPath(new URL('../data/geonames.db', import.meta.url))
  );
}

let cached: { path: string; database: DatabaseSync } | undefined;

/**
 * Opens the database read-only, reusing the connection already open.
 *
 * The dataset only changes when it is reimported: keeping the connection
 * alive avoids paying the cost of opening it on every call — autocomplete
 * makes one per keystroke. After a reimport, call `closeDatabase()` or
 * restart the process.
 *
 * A missing file raises an error with explicit instructions: the dataset is
 * not versioned and has to be imported once.
 */
export function openDatabase(databasePath?: string): DatabaseSync {
  const path = databasePath ?? defaultDatabasePath();
  if (cached?.path === path) return cached.database;

  if (!existsSync(path)) {
    throw new GeoError('DATABASE_MISSING', { path });
  }

  // A path different from the previous one only happens in tests: the old
  // connection has to be closed, not accumulated.
  closeDatabase();

  try {
    const database = new DatabaseSync(path, { readOnly: true });
    cached = { path, database };
    return database;
  } catch (error) {
    throw new GeoError('DATABASE_CORRUPT', {
      path,
      reason: error instanceof Error ? error.message : String(error),
    });
  }
}

/** Closes the reused connection. Needed by tests and after a reimport. */
export function closeDatabase(): void {
  if (!cached) return;
  const { database } = cached;
  cached = undefined;
  try {
    database.close();
  } catch {
    // Already closed elsewhere: that was the goal anyway.
  }
}

/**
 * Normalises a name for searching: lowercase, no diacritics, collapsed
 * whitespace.
 *
 * Used both at import time and at search time: they must apply exactly the
 * same transformation, otherwise accented entries become unreachable.
 */
export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2018\u2019\u02bc\u0060]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
