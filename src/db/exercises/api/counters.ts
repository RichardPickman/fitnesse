// ---------------------------------------------------------------------------
// Count helpers
// ---------------------------------------------------------------------------

import { supabase } from "@/supabase/client";

export async function countChangedExercises(since: string): Promise<number> {
  const { count, error } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', since);

  if (error) {
    throw new Error(`Failed to count exercises: ${error.message}`);
  }

  return count ?? 0;
}

export async function countChangedMappings(since: string): Promise<number> {
  const { count, error } = await supabase
    .from('exercise_muscle_mapping')
    .select('*', { count: 'exact', head: true })
    .gte('updated_at', since);

  if (error) {
    throw new Error(`Failed to count mappings: ${error.message}`);
  }

  return count ?? 0;
}
