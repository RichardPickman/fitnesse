import { create } from 'zustand';
import {
  getCachedExercises,
  getCachedMappings,
} from '../db/exercises/model/cache';
import {
  type Exercise,
  type MuscleGroup,
  type MuscleMapping,
  type SyncProgress,
} from '../db/exercises/types';

import { seedIfEmpty, syncExercisesFromCloud } from '@/db/exercises/exercises';
import { getLastSyncedAt } from '@/db/exercises/model/metadata';
import { SEED_MUSCLE_GROUPS } from '../db/seed-exercises';

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

  /** Sync state */
  isSyncing: boolean;
  syncProgress: SyncProgress | null;
  lastSyncedAt: string | null;

  /** Seed/load from local cache (no network) */
  loadLibrary: () => Promise<void>;

  /** Sync from Supabase with pagination (user-initiated) */
  syncFromCloud: () => Promise<void>;

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
  muscleGroups: SEED_MUSCLE_GROUPS, // hardcoded, never changes
  mappings: [],
  status: 'idle',
  errorMessage: null,
  isSyncing: false,
  syncProgress: null,
  lastSyncedAt: null,

  loadLibrary: async () => {
    set({ status: 'loading', errorMessage: null });

    try {
      await seedIfEmpty();

      const [exercises, mappings, lastSyncedAt] = await Promise.all([
        getCachedExercises(),
        getCachedMappings(),
        getLastSyncedAt(),
      ]);

      set({
        exercises,
        mappings,
        lastSyncedAt,
        status: 'ready',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load exercise library';
      set({ status: 'error', errorMessage: message });
    }
  },

  syncFromCloud: async () => {
    set({ isSyncing: true, syncProgress: null, errorMessage: null });

    try {
      await syncExercisesFromCloud((progress) => {
        set({ syncProgress: progress });
      });

      // Reload from cache after sync
      const [exercises, mappings, lastSyncedAt] = await Promise.all([
        getCachedExercises(),
        getCachedMappings(),
        getLastSyncedAt(),
      ]);

      set({
        exercises,
        mappings,
        lastSyncedAt,
        isSyncing: false,
        syncProgress: null,
        status: 'ready',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to sync exercises';
      set({
        isSyncing: false,
        syncProgress: null,
        errorMessage: message,
        status: 'error',
      });
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
