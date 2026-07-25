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
  days: PlanDay[];
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

function newId(): string {
  return crypto.randomUUID();
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
    result.push({ plan, days });
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

  return { plan, days };
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

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
export const DAY_LABELS_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
