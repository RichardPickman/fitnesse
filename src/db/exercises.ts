import { supabase } from '../supabase/client';
import { getDb } from './local';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MuscleGroup {
  id: string;
  parent_id: string | null;
  name: string;
  svg_zone_key: string | null;
  sort_order: number;
}
/**
 * Type for exercise instance, consisting: `name` `description` `equipment` `difficulty` `illustration url` `timestamps`
 */
export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  equipment_tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  illustration_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Muscle group with `primary` or `secondary` role in exercise
 */
export interface MuscleMapping {
  exercise_id: string;
  muscle_group_id: string;
  role: 'primary' | 'secondary';
}

// ---------------------------------------------------------------------------
// Fetch from Supabase with local cache fallback
// ---------------------------------------------------------------------------

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');

  if (error) {
    console.warn('[exercises] Supabase fetch failed, using cache', error.message);
    return getCachedExercises();
  }

  // Refresh local cache in background
  if (data && data.length > 0) {
    await cacheExercises(data as Exercise[]);
  }

  return (data ?? []) as Exercise[];
}

export async function fetchMuscleGroups(): Promise<MuscleGroup[]> {
  const { data, error } = await supabase
    .from('muscle_groups')
    .select('*')
    .order('sort_order');

  if (error) {
    console.warn('[muscleGroups] Supabase fetch failed, using cache', error.message);
    return getCachedMuscleGroups();
  }

  return (data ?? []) as MuscleGroup[];
}

export async function fetchMappings(): Promise<MuscleMapping[]> {
  const { data, error } = await supabase
    .from('exercise_muscle_mapping')
    .select('*');

  if (error) {
    console.warn('[mappings] Supabase fetch failed, using cache', error.message);
    return getCachedMappings();
  }

  // Refresh cache in background
  if (data && data.length > 0) {
    await cacheMappings(data as MuscleMapping[]);
  }

  return (data ?? []) as MuscleMapping[];
}

// ---------------------------------------------------------------------------
// Local cache helpers
// ---------------------------------------------------------------------------

async function cacheExercises(exercises: Exercise[]): Promise<void> {
  const db = await getDb();
  const stmt = await db.prepareAsync(
    `INSERT OR REPLACE INTO cached_exercises (id, name, description, equipment_tags, difficulty, illustration_url, cached_at)
     VALUES ($id, $name, $description, $tags, $difficulty, $illustration, datetime('now'))`,
  );

  for (const ex of exercises) {
    await stmt.executeAsync({
      $id: ex.id,
      $name: ex.name,
      $description: ex.description,
      $tags: JSON.stringify(ex.equipment_tags),
      $difficulty: ex.difficulty,
      $illustration: ex.illustration_url,
    });
  }

  await stmt.finalizeAsync();
}

async function getCachedExercises(): Promise<Exercise[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM cached_exercises ORDER BY name',
  );
  return rows.map(mapRowToExercise);
}

function mapRowToExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    equipment_tags: JSON.parse((row.equipment_tags as string) ?? '[]'),
    difficulty: (row.difficulty as 'beginner' | 'intermediate' | 'advanced'),
    illustration_url: (row.illustration_url as string) ?? null,
    created_at: (row.cached_at as string) ?? '',
    updated_at: (row.cached_at as string) ?? '',
  };
}

async function cacheMappings(mappings: MuscleMapping[]): Promise<void> {
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

async function getCachedMappings(): Promise<MuscleMapping[]> {
  const db = await getDb();
  return db.getAllAsync<MuscleMapping>(
    'SELECT * FROM cached_muscle_mappings',
  );
}

async function getCachedMuscleGroups(): Promise<MuscleGroup[]> {
  // Muscle groups rarely change — we don't cache them locally yet.
  // Could add a cached_muscle_groups table if needed.
  return [];
}
