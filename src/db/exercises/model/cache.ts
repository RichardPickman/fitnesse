import { getDb } from "@/db/local";
import { Exercise, MuscleMapping } from "../types";

function mapRowToExercise(row: Record<string, unknown>): Exercise {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) ?? null,
    equipment_tags: JSON.parse((row.equipment_tags as string) ?? '[]'),
    difficulty: (row.difficulty as 'beginner' | 'intermediate' | 'advanced'),
    illustration_url: (row.illustration_url as string) ?? null,
    created_at: (row.cached_at as string) ?? '',
    updated_at: (row.updated_at as string) ?? '',
  };
}

export async function getCachedExercises(): Promise<Exercise[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM cached_exercises ORDER BY name',
  );

  return rows.map(mapRowToExercise);
}

export async function getCachedMappings(): Promise<MuscleMapping[]> {
  const db = await getDb();

  return db.getAllAsync<MuscleMapping>(
    'SELECT * FROM cached_muscle_mappings',
  );
}