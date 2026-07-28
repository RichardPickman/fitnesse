import * as SQLite from 'expo-sqlite';

const DB_NAME = 'fitnesse.db';

let _db: SQLite.SQLiteDatabase | null = null;

async function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (!_db) {
    _db = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return _db;
}

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await openDb();

  // Plans
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plans (
      id              TEXT PRIMARY KEY,
      name            TEXT NOT NULL,
      description     TEXT,
      equipment_tags  TEXT DEFAULT '[]',
      version_hash    TEXT NOT NULL,
      created_at      TEXT DEFAULT (datetime('now')),
      updated_at      TEXT DEFAULT (datetime('now'))
    );
  `);

  // Plan days
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plan_days (
      id              TEXT PRIMARY KEY,
      plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
      day_of_week     INTEGER NOT NULL,
      sort_order      INTEGER DEFAULT 0
    );
  `);

  // Exercise entries within a day
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS plan_exercise_entries (
      id              TEXT PRIMARY KEY,
      plan_day_id     TEXT NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
      exercise_id     TEXT NOT NULL,
      target_sets     INTEGER NOT NULL DEFAULT 3,
      target_reps     INTEGER NOT NULL DEFAULT 10,
      rest_seconds    INTEGER NOT NULL DEFAULT 90,
      weight_kg       REAL,
      superset_group  TEXT,
      sort_order      INTEGER DEFAULT 0
    );
  `);

  // Workout sessions
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id                TEXT PRIMARY KEY,
      plan_id           TEXT REFERENCES plans(id),
      plan_day_id       TEXT,
      plan_version_hash TEXT,
      started_at        TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at      TEXT,
      duration_seconds  INTEGER,
      notes             TEXT,
      rating            INTEGER
    );
  `);

  // Set logs
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS set_logs (
      id              TEXT PRIMARY KEY,
      session_id      TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id     TEXT NOT NULL,
      set_number      INTEGER NOT NULL,
      reps_actual     INTEGER NOT NULL,
      weight_kg       REAL,
      completed_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // Progress photos
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS progress_photos (
      id              TEXT PRIMARY KEY,
      session_id      TEXT REFERENCES workout_sessions(id) ON DELETE SET NULL,
      file_path       TEXT NOT NULL,
      taken_at        TEXT NOT NULL DEFAULT (datetime('now')),
      body_region     TEXT
    );
  `);

  // Cached exercise library (offline support)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_exercises (
      id               TEXT PRIMARY KEY,
      name             TEXT NOT NULL,
      description      TEXT,
      equipment_tags   TEXT DEFAULT '[]',
      difficulty       TEXT,
      illustration_url TEXT,
      cached_at        TEXT DEFAULT (datetime('now'))
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS cached_muscle_mappings (
      exercise_id     TEXT NOT NULL,
      muscle_group_id TEXT NOT NULL,
      role            TEXT NOT NULL,
      PRIMARY KEY (exercise_id, muscle_group_id, role)
    );
  `);

  return db;
}

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  return openDb();
}
