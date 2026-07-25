import { getDb } from './local';
import type { PlanExerciseEntry } from './plans';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkoutSession {
  id: string;
  plan_id: string | null;
  plan_day_id: string | null;
  plan_version_hash: string | null;
  started_at: string;
  completed_at: string | null;
  duration_seconds: number | null;
  notes: string | null;
  rating: number | null;
}

export interface SetLog {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps_actual: number;
  weight_kg: number | null;
  completed_at: string;
}

function newId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Workout session CRUD
// ---------------------------------------------------------------------------

export async function startSession(
  planId: string,
  planDayId: string,
  planVersionHash: string,
): Promise<string> {
  const db = await getDb();
  const sessionId = newId();
  await db.runAsync(
    `INSERT INTO workout_sessions (id, plan_id, plan_day_id, plan_version_hash)
     VALUES (?, ?, ?, ?)`,
    [sessionId, planId, planDayId, planVersionHash],
  );
  return sessionId;
}

export async function completeSession(
  sessionId: string,
  durationSeconds: number,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE workout_sessions SET completed_at = datetime('now'), duration_seconds = ? WHERE id = ?",
    [durationSeconds, sessionId],
  );
}

export async function addNotes(sessionId: string, notes: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE workout_sessions SET notes = ? WHERE id = ?',
    [notes, sessionId],
  );
}

// ---------------------------------------------------------------------------
// Set logging
// ---------------------------------------------------------------------------

export async function logSet(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  repsActual: number,
  weightKg: number | null,
): Promise<string> {
  const db = await getDb();
  const setId = newId();
  await db.runAsync(
    `INSERT INTO set_logs (id, session_id, exercise_id, set_number, reps_actual, weight_kg)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [setId, sessionId, exerciseId, setNumber, repsActual, weightKg],
  );
  return setId;
}

export async function getSetsForSession(sessionId: string): Promise<SetLog[]> {
  const db = await getDb();
  return db.getAllAsync<SetLog>(
    'SELECT * FROM set_logs WHERE session_id = ? ORDER BY completed_at',
    [sessionId],
  );
}

export async function getSetsForExercise(
  sessionId: string,
  exerciseId: string,
): Promise<SetLog[]> {
  const db = await getDb();
  return db.getAllAsync<SetLog>(
    'SELECT * FROM set_logs WHERE session_id = ? AND exercise_id = ? ORDER BY set_number',
    [sessionId, exerciseId],
  );
}

// ---------------------------------------------------------------------------
// Derived stats
// ---------------------------------------------------------------------------

export async function getSessionVolume(sessionId: string): Promise<number> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ total: number | null }>(
    'SELECT COALESCE(SUM(reps_actual * COALESCE(weight_kg, 0)), 0) as total FROM set_logs WHERE session_id = ?',
    [sessionId],
  );
  return result?.total ?? 0;
}

export async function getSessionSetCount(sessionId: string): Promise<number> {
  const db = await getDb();
  const result = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM set_logs WHERE session_id = ?',
    [sessionId],
  );
  return result?.count ?? 0;
}

export async function getLastSession(): Promise<WorkoutSession | null> {
  const db = await getDb();
  return db.getFirstAsync<WorkoutSession>(
    "SELECT * FROM workout_sessions WHERE completed_at IS NOT NULL ORDER BY started_at DESC LIMIT 1",
  );
}

export async function getLastSessionVolume(): Promise<number> {
  const session = await getLastSession();
  if (!session) return 0;
  return getSessionVolume(session.id);
}
