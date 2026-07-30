// ---------------------------------------------------------------------------
// Local cache writers
// ---------------------------------------------------------------------------

import { getDb } from "@/db/local";
import { SEED_EXERCISES, SEED_MAPPINGS } from "@/db/seed-exercises";
import { Exercise, MuscleMapping } from "../types";

export async function upsertExercises(exercises: Exercise[]): Promise<void> {
  const db = await getDb();
  const stmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO cached_exercises (id, name, description, equipment_tags, difficulty, illustration_url, updated_at, cached_at)
     VALUES ($id, $name, $description, $tags, $difficulty, $illustration, $updatedAt, datetime('now'))`,
  );

  for (const ex of exercises) {
    await stmt.executeAsync({
      $id: ex.id,
      $name: ex.name,
      $description: ex.description,
      $tags: JSON.stringify(ex.equipment_tags),
      $difficulty: ex.difficulty,
      $illustration: ex.illustration_url,
      $updatedAt: ex.updated_at,
    });
  }

  await stmt.finalizeAsync();
}

export async function upsertMappings(mappings: MuscleMapping[]): Promise<void> {
  if (mappings.length === 0) {
    return;
  }

  const db = await getDb();
  const stmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO cached_muscle_mappings (exercise_id, muscle_group_id, role)
     VALUES ($eid, $mgid, $role)`,
  );

  for (const m of mappings) {
    await stmt.executeAsync({
      $eid: m.exercise_id,
      $mgid: m.muscle_group_id,
      $role: m.role,
    });
  }

  await stmt.finalizeAsync();
}

// ---------------------------------------------------------------------------
// Seed: populate local DB from hardcoded bundle on first launch
// ---------------------------------------------------------------------------

export async function seedIfEmpty(): Promise<void> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) AS count FROM cached_exercises',
  );

  if (row && row.count > 0) {
    return; // already seeded
  }

  console.log('[exercises] Seeding local DB from hardcoded bundle');

  // Seed exercises
  const exStmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO cached_exercises (id, name, description, equipment_tags, difficulty, illustration_url, updated_at, cached_at)
     VALUES ($id, $name, $description, $tags, $difficulty, $illustration, $updatedAt, datetime('now'))`,
  );

  for (const ex of SEED_EXERCISES) {
    await exStmt.executeAsync({
      $id: ex.id,
      $name: ex.name,
      $description: ex.description,
      $tags: JSON.stringify(ex.equipment_tags),
      $difficulty: ex.difficulty,
      $illustration: ex.illustration_url,
      $updatedAt: ex.updated_at,
    });
  }

  await exStmt.finalizeAsync();

  // Seed mappings
  const mapStmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO cached_muscle_mappings (exercise_id, muscle_group_id, role)
     VALUES ($eid, $mgid, $role)`,
  );

  for (const m of SEED_MAPPINGS) {
    await mapStmt.executeAsync({
      $eid: m.exercise_id,
      $mgid: m.muscle_group_id,
      $role: m.role,
    });
  }

  await mapStmt.finalizeAsync();
}