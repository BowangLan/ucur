import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema.js";

// SQLite by default. To use Postgres: swap to drizzle-orm/postgres-js + postgres,
// use pgTable/pg-core in schema.ts, and set DATABASE_URL=postgresql://...
const dbPath = process.env.DATABASE_URL ?? "./data/ucur.db";
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function hasTable(sqlite: Database.Database, tableName: string) {
  const row = sqlite
    .prepare(
      "select 1 from sqlite_master where type = 'table' and name = ? limit 1",
    )
    .get(tableName);
  return Boolean(row);
}

function hasColumn(sqlite: Database.Database, tableName: string, columnName: string) {
  const rows = sqlite.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === columnName);
}

function ensureLegacyTables(sqlite: Database.Database) {
  if (!hasTable(sqlite, "settings")) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id text PRIMARY KEY NOT NULL DEFAULT 'default',
        model text DEFAULT 'claude-sonnet-4-20250514',
        theme text DEFAULT 'system',
        updated_at integer NOT NULL
      );
    `);
  }

  if (!hasTable(sqlite, "screens")) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS screens (
        id text PRIMARY KEY NOT NULL,
        image_mime_type text NOT NULL,
        image_sha256 text NOT NULL,
        description text NOT NULL,
        model text NOT NULL,
        created_at integer NOT NULL
      );
    `);
  }

  if (!hasTable(sqlite, "projects")) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        description text NOT NULL DEFAULT '',
        working_directory text,
        created_at integer NOT NULL,
        updated_at integer NOT NULL
      );
    `);
  }

  sqlite.exec(`
    INSERT INTO projects (id, name, description, working_directory, created_at, updated_at)
    VALUES (
      'default-project',
      'Default Project',
      'Auto-created project for existing screens',
      NULL,
      CAST(unixepoch('now') * 1000 AS INTEGER),
      CAST(unixepoch('now') * 1000 AS INTEGER)
    )
    ON CONFLICT(id) DO NOTHING;
  `);

  if (!hasTable(sqlite, "saved_screens")) {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS saved_screens (
        id text PRIMARY KEY NOT NULL,
        project_id text NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
        name text NOT NULL,
        notes text NOT NULL DEFAULT '',
        preview_url text,
        analysis text,
        analysis_status text NOT NULL DEFAULT 'idle',
        analysis_error text,
        created_at integer NOT NULL,
        updated_at integer NOT NULL
      );
    `);
  } else if (!hasColumn(sqlite, "saved_screens", "project_id")) {
    sqlite.exec(`
      ALTER TABLE saved_screens ADD COLUMN project_id text REFERENCES projects(id);
      UPDATE saved_screens SET project_id = 'default-project' WHERE project_id IS NULL;
    `);
  }
}

function getMigrationsFolder() {
  // Works when running from src (tsx) and dist (node/compiled JS).
  const fromSrc = resolve(import.meta.dirname, "../drizzle");
  if (existsSync(fromSrc)) {
    return fromSrc;
  }

  return resolve(import.meta.dirname, "../../drizzle");
}

export function createDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite, { schema });

  migrate(db, { migrationsFolder: getMigrationsFolder() });
  ensureLegacyTables(sqlite);

  dbInstance = db;
  return dbInstance;
}

export type Db = ReturnType<typeof createDb>;
