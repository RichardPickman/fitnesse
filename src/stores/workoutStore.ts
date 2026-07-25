import { create } from 'zustand';
import {
  startSession,
  logSet,
  completeSession,
  getSessionVolume,
  getSessionSetCount,
  getSetsForExercise,
} from '@/db/workout';
import type { PlanExerciseEntry } from '@/db/plans';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WorkoutExercise {
  entry: PlanExerciseEntry;
  currentSet: number;   // 1-based, next set to complete
  completed: boolean;   // all sets done
}

export interface WorkoutState {
  // Session
  sessionId: string | null;
  startedAt: Date | null;

  // Exercises
  exercises: WorkoutExercise[];
  currentExerciseIndex: number;

  // Timer
  restTimerEnd: Date | null;
  restTimerRunning: boolean;

  // Actions
  initWorkout: (
    planId: string,
    planDayId: string,
    planVersionHash: string,
    entries: PlanExerciseEntry[],
  ) => Promise<void>;
  completeSet: (reps: number, weightKg: number | null) => Promise<void>;
  nextExercise: () => void;
  startRest: (seconds: number) => void;
  skipRest: () => void;
  finishWorkout: () => Promise<{ duration: number; volume: number; sets: number }>;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessionId: null,
  startedAt: null,
  exercises: [],
  currentExerciseIndex: 0,
  restTimerEnd: null,
  restTimerRunning: false,

  initWorkout: async (planId: string, planDayId: string, planVersionHash: string, entries) => {
    const sessionId = await startSession(planId, planDayId, planVersionHash);
    set({
      sessionId,
      startedAt: new Date(),
      exercises: entries
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((entry) => ({
          entry,
          currentSet: 1,
          completed: false,
        })),
      currentExerciseIndex: 0,
      restTimerEnd: null,
      restTimerRunning: false,
    });
  },

  completeSet: async (reps, weightKg) => {
    const state = get();
    const { sessionId, exercises, currentExerciseIndex } = state;
    if (!sessionId) return;

    const ex = exercises[currentExerciseIndex];
    if (!ex || ex.completed) return;

    // Log the set
    await logSet(sessionId, ex.entry.exercise_id, ex.currentSet, reps, weightKg);

    // Advance or complete
    const nextSet = ex.currentSet + 1;
    const allDone = nextSet > ex.entry.target_sets;

    const updated = [...exercises];
    updated[currentExerciseIndex] = {
      ...ex,
      currentSet: allDone ? ex.currentSet : nextSet,
      completed: allDone,
    };

    set({ exercises: updated });
  },

  nextExercise: () => {
    const state = get();
    const nextIndex = state.currentExerciseIndex + 1;
    if (nextIndex < state.exercises.length) {
      set({ currentExerciseIndex: nextIndex });
    }
  },

  startRest: (seconds) => {
    const end = new Date(Date.now() + seconds * 1000);
    set({ restTimerEnd: end, restTimerRunning: true });
  },

  skipRest: () => {
    set({ restTimerEnd: null, restTimerRunning: false });
  },

  finishWorkout: async () => {
    const state = get();
    const { sessionId, startedAt } = state;
    if (!sessionId || !startedAt) {
      return { duration: 0, volume: 0, sets: 0 };
    }

    const endedAt = new Date();
    const durationSeconds = Math.round(
      (endedAt.getTime() - startedAt.getTime()) / 1000,
    );

    await completeSession(sessionId, durationSeconds);
    const volume = await getSessionVolume(sessionId);
    const sets = await getSessionSetCount(sessionId);

    return { duration: durationSeconds, volume, sets };
  },

  reset: () => {
    set({
      sessionId: null,
      startedAt: null,
      exercises: [],
      currentExerciseIndex: 0,
      restTimerEnd: null,
      restTimerRunning: false,
    });
  },
}));
