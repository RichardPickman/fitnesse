import { newId } from './helpers';
import { getDb } from './local';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  equipment_tags: string; // JSON array
  version_hash: string;
  created_at: string;
  updated_at: string;
}

export interface PlanDay {
  id: string;
  plan_id: string;
  day_of_week: number; // 0=Mon, 1=Tue, ..., 6=Sun
  sort_order: number;
}

export interface PlanExerciseEntry {
  id: string;
  plan_day_id: string;
  exercise_id: string;
  target_sets: number;
  target_reps: number;
  rest_seconds: number;
  weight_kg: number | null;
  superset_group: string | null;
  sort_order: number;
}

export interface PlanWithDays {
  plan: Plan;
  days: (PlanDay & { entries: PlanExerciseEntry[] })[];
}

function hashPlanContent(name: string, days: number[]): string {
  // Simple hash for version tracking — not cryptographic, just for diffing
  const sorted = [...days].sort().join(',');
  const raw = `${name}|${sorted}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit int
  }
  return Math.abs(hash).toString(16);
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function createPlan(
  name: string,
  description: string | null,
  dayIndices: number[],
): Promise<string> {
  const db = await getDb();
  const planId = newId();
  const versionHash = hashPlanContent(name, dayIndices);

  await db.runAsync(
    `INSERT INTO plans (id, name, description, equipment_tags, version_hash)
     VALUES (?, ?, ?, '[]', ?)`,
    [planId, name, description, versionHash],
  );

  // Insert plan days
  const stmt = await db.prepareAsync(
    'INSERT INTO plan_days (id, plan_id, day_of_week, sort_order) VALUES (?, ?, ?, ?)',
  );

  for (let i = 0; i < dayIndices.length; i++) {
    await stmt.executeAsync([newId(), planId, dayIndices[i], i]);
  }

  await stmt.finalizeAsync();

  return planId;
}

export async function getPlans(): Promise<PlanWithDays[]> {
  const db = await getDb();
  const plans = await db.getAllAsync<Plan>(
    'SELECT * FROM plans ORDER BY updated_at DESC',
  );

  const result: PlanWithDays[] = [];

  for (const plan of plans) {
    const days = await db.getAllAsync<PlanDay>(
      'SELECT * FROM plan_days WHERE plan_id = ? ORDER BY sort_order',
      [plan.id],
    );
    const daysWithEntries = await Promise.all(
      days.map(async (day) => {
        const entries = await getEntriesForDay(day.id);
        return { ...day, entries };
      }),
    );
    result.push({ plan, days: daysWithEntries });
  }

  return result;
}

export async function getPlanById(planId: string): Promise<PlanWithDays | null> {
  const db = await getDb();
  const plan = await db.getFirstAsync<Plan>(
    'SELECT * FROM plans WHERE id = ?',
    [planId],
  );

  if (!plan) return null;

  const days = await db.getAllAsync<PlanDay>(
    'SELECT * FROM plan_days WHERE plan_id = ? ORDER BY sort_order',
    [planId],
  );

  const daysWithEntries = await Promise.all(
    days.map(async (day) => {
      const entries = await getEntriesForDay(day.id);
      return { ...day, entries };
    }),
  );

  return { plan, days: daysWithEntries };
}

export async function deletePlan(planId: string): Promise<void> {
  const db = await getDb();

  // CASCADE should handle plan_days, but let's be explicit
  await db.runAsync('DELETE FROM plan_exercise_entries WHERE plan_day_id IN (SELECT id FROM plan_days WHERE plan_id = ?)', [planId]);
  await db.runAsync('DELETE FROM plan_days WHERE plan_id = ?', [planId]);
  await db.runAsync('DELETE FROM plans WHERE id = ?', [planId]);
}

export async function updatePlanName(planId: string, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE plans SET name = ?, updated_at = datetime('now') WHERE id = ?",
    [name, planId],
  );
}

export async function updatePlan(
  planId: string,
  name: string,
  description: string | null,
  dayIndices: number[],
): Promise<void> {
  const db = await getDb();
  const versionHash = hashPlanContent(name, dayIndices);

  await db.runAsync(
    "UPDATE plans SET name = ?, description = ?, version_hash = ?, updated_at = datetime('now') WHERE id = ?",
    [name, description, versionHash, planId],
  );

  // Replace days: delete old, insert new
  await db.runAsync('DELETE FROM plan_days WHERE plan_id = ?', [planId]);

  const stmt = await db.prepareAsync(
    'INSERT INTO plan_days (id, plan_id, day_of_week, sort_order) VALUES (?, ?, ?, ?)',
  );

  for (let i = 0; i < dayIndices.length; i++) {
    await stmt.executeAsync([newId(), planId, dayIndices[i], i]);
  }

  await stmt.finalizeAsync();
}

// ---------------------------------------------------------------------------
// Exercise entries CRUD
// ---------------------------------------------------------------------------

export async function getEntriesForDay(dayId: string): Promise<PlanExerciseEntry[]> {
  const db = await getDb();
  return db.getAllAsync<PlanExerciseEntry>(
    'SELECT * FROM plan_exercise_entries WHERE plan_day_id = ? ORDER BY sort_order',
    [dayId],
  );
}

export async function addExerciseToDay(
  dayId: string,
  exerciseId: string,
  sortOrder: number,
): Promise<string> {
  const db = await getDb();
  const entryId = newId();
  await db.runAsync(
    `INSERT INTO plan_exercise_entries (id, plan_day_id, exercise_id, target_sets, target_reps, rest_seconds)
     VALUES (?, ?, ?, 3, 10, 90)`,
    [entryId, dayId, exerciseId],
  );
  return entryId;
}

export async function removeExerciseFromDay(entryId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM plan_exercise_entries WHERE id = ?', [entryId]);
}

export async function updateExerciseEntry(
  entryId: string,
  updates: Partial<Pick<PlanExerciseEntry, 'target_sets' | 'target_reps' | 'rest_seconds' | 'weight_kg' | 'superset_group'>>,
): Promise<void> {
  const db = await getDb();
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.target_sets !== undefined) { fields.push('target_sets = ?'); values.push(updates.target_sets); }
  if (updates.target_reps !== undefined) { fields.push('target_reps = ?'); values.push(updates.target_reps); }
  if (updates.rest_seconds !== undefined) { fields.push('rest_seconds = ?'); values.push(updates.rest_seconds); }
  if (updates.weight_kg !== undefined) { fields.push('weight_kg = ?'); values.push(updates.weight_kg); }
  if (updates.superset_group !== undefined) { fields.push('superset_group = ?'); values.push(updates.superset_group); }

  if (fields.length === 0) return;

  values.push(entryId);
  await db.runAsync(
    `UPDATE plan_exercise_entries SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );
}

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
