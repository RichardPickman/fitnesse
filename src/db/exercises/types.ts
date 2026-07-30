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

export interface MuscleMapping {
  exercise_id: string;
  muscle_group_id: string;
  role: 'primary' | 'secondary';
}

export interface SyncProgress {
  current: number;
  total: number | null;
  phase: 'counting' | 'exercises' | 'mappings' | 'saving' | 'done';
}