import { create } from 'zustand';
import {
  type Exercise,
  type MuscleGroup,
  type MuscleMapping,
  fetchExercises,
  fetchMuscleGroups,
  fetchMappings,
} from '../db/exercises';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExerciseState {
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  mappings: MuscleMapping[];

  /** `idle` | `loading` | `ready` | `error` */
  status: 'idle' | 'loading' | 'ready' | 'error';
  errorMessage: string | null;

  /** Fetch the full exercise library from Supabase (falls back to cache) */
  loadLibrary: () => Promise<void>;

  /** Get primary and secondary muscle groups for a given exercise */
  getMusclesForExercise: (exerciseId: string) => {
    primary: MuscleGroup[];
    secondary: MuscleGroup[];
  };

  /** Get all exercises that target a given muscle group */
  getExercisesByMuscleGroup: (muscleGroupId: string) => Exercise[];

  /** Filter exercises by equipment tag */
  getExercisesByEquipment: (tag: string) => Exercise[];

  /** Filter exercises by difficulty */
  getExercisesByDifficulty: (level: Exercise['difficulty']) => Exercise[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function muscleMapToGroups(
  mappings: MuscleMapping[],
  muscleGroups: MuscleGroup[],
  exerciseId: string,
) {
  const primary: MuscleGroup[] = [];
  const secondary: MuscleGroup[] = [];

  for (const m of mappings) {
    if (m.exercise_id !== exerciseId) continue;
    const group = muscleGroups.find((g) => g.id === m.muscle_group_id);
    if (!group) continue;
    if (m.role === 'primary') primary.push(group);
    else secondary.push(group);
  }

  return { primary, secondary };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  muscleGroups: [],
  mappings: [],
  status: 'idle',
  errorMessage: null,

  loadLibrary: async () => {
    set({ status: 'loading', errorMessage: null });

    try {
      const [exercises, muscleGroups, mappings] = await Promise.all([
        fetchExercises(),
        fetchMuscleGroups(),
        fetchMappings(),
      ]);

      set({ exercises, muscleGroups, mappings, status: 'ready' });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load exercise library';
      set({ status: 'error', errorMessage: message });
    }
  },

  getMusclesForExercise: (exerciseId) => {
    const { mappings, muscleGroups } = get();
    return muscleMapToGroups(mappings, muscleGroups, exerciseId);
  },

  getExercisesByMuscleGroup: (muscleGroupId) => {
    const { exercises, mappings } = get();
    const exerciseIds = new Set(
      mappings
        .filter((m) => m.muscle_group_id === muscleGroupId)
        .map((m) => m.exercise_id),
    );
    return exercises.filter((e) => exerciseIds.has(e.id));
  },

  getExercisesByEquipment: (tag) => {
    return get().exercises.filter((e) => e.equipment_tags.includes(tag));
  },

  getExercisesByDifficulty: (level) => {
    return get().exercises.filter((e) => e.difficulty === level);
  },
}));
