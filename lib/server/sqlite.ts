import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

type SqlJsModule = {
  Database: new (data?: Uint8Array) => SqliteDb;
};

export type SqliteDb = {
  run: (sql: string, params?: unknown[]) => void;
  prepare: (sql: string) => {
    bind: (params: unknown[]) => void;
    step: () => boolean;
    getAsObject: () => Record<string, unknown>;
    free: () => void;
  };
  export: () => Uint8Array;
  getRowsModified: () => number;
  close: () => void;
};

type DbWithInit = {
  db: SqliteDb;
  initPromise: Promise<void>;
  dbPath: string;
};

const globalForDb = globalThis as unknown as {
  __myNextAppDb?: DbWithInit;
};

function getDbPath() {
  const configured = process.env.SQLITE_PATH?.trim();
  if (configured) return configured;
  if (process.env.VERCEL) return '/tmp/my-next-app.db';
  return path.join(process.cwd(), 'data', 'my-next-app.db');
}

async function loadSqlJs() {
  const mod = (await import('sql.js')) as unknown as { default?: unknown } & Record<string, unknown>;
  const init = (mod.default ?? mod) as (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsModule>;
  const wasmDir = path.join(process.cwd(), 'node_modules', 'sql.js', 'dist');
  return init({
    locateFile: (file) => path.join(wasmDir, file),
  });
}

function openDb(sqlJs: SqlJsModule, dbPath: string) {
  mkdirSync(path.dirname(dbPath), { recursive: true });
  try {
    const raw = readFileSync(dbPath);
    return new sqlJs.Database(new Uint8Array(raw));
  } catch {
    return new sqlJs.Database();
  }
}

function persistDb(db: SqliteDb, dbPath: string) {
  const data = db.export();
  writeFileSync(dbPath, Buffer.from(data));
}

export async function run(db: SqliteDb, dbPath: string, sql: string, params: unknown[] = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const last = await get<{ id: number }>(db, 'SELECT last_insert_rowid() as id');
  persistDb(db, dbPath);
  return { lastID: last?.id ?? 0, changes };
}

export async function get<T>(db: SqliteDb, sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    if (!stmt.step()) return undefined;
    return stmt.getAsObject() as unknown as T;
  } finally {
    stmt.free();
  }
}

export async function all<T>(db: SqliteDb, sql: string, params: unknown[] = []) {
  const stmt = db.prepare(sql);
  const rows: T[] = [];
  try {
    stmt.bind(params);
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as unknown as T);
    }
    return rows;
  } finally {
    stmt.free();
  }
}

async function initSchema(db: SqliteDb, dbPath: string) {
  await run(db, dbPath, 'PRAGMA foreign_keys = ON');
  await run(
    db,
    dbPath,
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, username TEXT NOT NULL, password_hash TEXT NOT NULL, password_salt TEXT NOT NULL, created_at TEXT NOT NULL)'
  );
  await run(db, dbPath, 'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
}

export async function getDb() {
  if (!globalForDb.__myNextAppDb) {
    const dbPath = getDbPath();
    const sqlJs = await loadSqlJs();
    const db = openDb(sqlJs, dbPath);
    const initPromise = initSchema(db, dbPath);
    globalForDb.__myNextAppDb = { db, initPromise, dbPath };
  }
  await globalForDb.__myNextAppDb.initPromise;
  return { db: globalForDb.__myNextAppDb.db, dbPath: globalForDb.__myNextAppDb.dbPath };
}
