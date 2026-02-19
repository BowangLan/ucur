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

  dbInstance = db;
  return dbInstance;
}

export type Db = ReturnType<typeof createDb>;
