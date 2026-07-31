import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';
import { env } from './env.js';

export type DatabaseConnection = Database.Database;

function unicodeLower(value: unknown): string {
  return typeof value === 'string' ? value.toLocaleLowerCase('es') : '';
}

export function createDatabase(databasePath = env.DATABASE_PATH): DatabaseConnection {
  if (databasePath !== ':memory:') {
    fs.mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true });
  }

  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  database.function('unicode_lower', { deterministic: true }, unicodeLower);
  database.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'done')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  return database;
}
