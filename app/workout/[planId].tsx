import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { useExerciseStore } from '@/stores/exerciseStore';
import { usePlanStore } from '@/stores/planStore';
import { useWorkoutStore } from '@/stores/workoutStore';

export default function WorkoutPlayerScreen() {
  const { planId, dayId } = useLocalSearchParams<{ planId: string; dayId: string }>();
  const { plans } = usePlanStore();
  const { exercises: exerciseLib, getMusclesForExercise } = useExerciseStore();
  const {
    sessionId,
    exercises,
    currentExerciseIndex,
    restTimerRunning,
    restTimerEnd,
    initWorkout,
    completeSet,
    nextExercise,
    startRest,
    skipRest,
    finishWorkout,
  } = useWorkoutStore();

  const plan = plans.find((p) => p.plan.id === planId);
  const day = plan?.days.find((d) => d.id === dayId);
  const currentWorkoutEx = exercises[currentExerciseIndex];
  const currentExercise = currentWorkoutEx
    ? exerciseLib.find((e) => e.id === currentWorkoutEx.entry.exercise_id)
    : null;

  const [repsOverride, setRepsOverride] = useState<number | null>(null);
  const [restCountdown, setRestCountdown] = useState<number | null>(null);
  const restInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init workout on mount
  useEffect(() => {
    if (plan && day) {
      initWorkout(
        plan.plan.id,
        day.id,
        plan.plan.version_hash,
        day.entries,
      );
    }
    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, []);

  // Rest timer countdown
  useEffect(() => {
    if (restTimerRunning && restTimerEnd) {
      restInterval.current = setInterval(() => {
        const remaining = Math.max(
          0,
          Math.round((restTimerEnd.getTime() - Date.now()) / 1000),
        );
        setRestCountdown(remaining);
        if (remaining <= 0) {
          if (restInterval.current) clearInterval(restInterval.current);
          skipRest();
          setRestCountdown(null);
        }
      }, 250);
    } else {
      if (restInterval.current) clearInterval(restInterval.current);
      setRestCountdown(null);
    }
    return () => {
      if (restInterval.current) clearInterval(restInterval.current);
    };
  }, [restTimerRunning, restTimerEnd?.getTime()]);

  const handleCompleteSet = () => {
    const reps = repsOverride ?? currentWorkoutEx?.entry.target_reps ?? 10;
    const weight = currentWorkoutEx?.entry.weight_kg ?? null;
    completeSet(reps, weight);
    setRepsOverride(null);
  };

  const handleFinishWorkout = async () => {
    const result = await finishWorkout();
    router.replace(
      `/workout/complete?duration=${result.duration}&volume=${result.volume}&sets=${result.sets}&sessionId=${sessionId}`,
    );
  };

  // If workout is done (all exercises completed), auto-finish
  const allCompleted = exercises.length > 0 && exercises.every((e) => e.completed);
  if (allCompleted && sessionId) {
    handleFinishWorkout();
    return null;
  }

  // Progress
  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((e) => e.completed).length;
  const progress = totalExercises > 0 ? completedExercises / totalExercises : 0;

  const primaryMuscles = currentExercise
    ? getMusclesForExercise(currentExercise.id).primary.map((m) => m.name).join(', ')
    : '';

  if (!currentWorkoutEx || !currentExercise) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ color: colors.textSecondary }}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Exercise info */}
      <View style={styles.exerciseSection}>
        <Text style={styles.exerciseName}>{currentExercise.name}</Text>
        {primaryMuscles ? (
          <Text style={styles.muscles}>{primaryMuscles}</Text>
        ) : null}
        <Text style={styles.equipment}>
          {currentExercise.equipment_tags.join(' · ') || 'No equipment'}
        </Text>
      </View>

      {/* Set counter */}
      <View style={styles.setSection}>
        <Text style={styles.setLabel}>
          Set {currentWorkoutEx.currentSet} of {currentWorkoutEx.entry.target_sets}
        </Text>

        {/* Reps display */}
        <View style={styles.repsRow}>
          <TouchableOpacity
            onPress={() =>
              setRepsOverride(
                repsOverride === null
                  ? currentWorkoutEx.entry.target_reps - 2
                  : repsOverride - 1,
              )
            }
            style={styles.repAdjust}
          >
            <Text style={styles.repAdjustText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.repsValue}>
            {repsOverride ?? currentWorkoutEx.entry.target_reps}
          </Text>
          <TouchableOpacity
            onPress={() =>
              setRepsOverride(
                repsOverride === null
                  ? currentWorkoutEx.entry.target_reps + 2
                  : repsOverride + 1,
              )
            }
            style={styles.repAdjust}
          >
            <Text style={styles.repAdjustText}>+</Text>
          </TouchableOpacity>
          <Text style={styles.repsLabel}>reps</Text>
        </View>
      </View>

      {/* Complete Set button */}
      <TouchableOpacity
        style={styles.completeButton}
        onPress={handleCompleteSet}
        activeOpacity={0.8}
      >
        <Text style={styles.completeButtonText}>
          {currentWorkoutEx.currentSet < currentWorkoutEx.entry.target_sets
            ? 'Complete Set'
            : 'Complete Last Set'}
        </Text>
      </TouchableOpacity>

      {/* Rest timer */}
      {!restTimerRunning ? (
        <TouchableOpacity
          style={styles.restButton}
          onPress={() => startRest(currentWorkoutEx.entry.rest_seconds)}
        >
          <Text style={styles.restButtonText}>
            Start Rest ({currentWorkoutEx.entry.rest_seconds}s)
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.restActive}>
          <Text style={styles.restCountdown}>
            {restCountdown !== null
              ? `${Math.floor(restCountdown / 60)}:${String(restCountdown % 60).padStart(2, '0')}`
              : '...'}
          </Text>
          <TouchableOpacity onPress={skipRest}>
            <Text style={styles.skipRest}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Skip set / Next exercise */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => {
            // Mark current exercise as done and move on
            const updated = [...exercises];
            updated[currentExerciseIndex] = {
              ...currentWorkoutEx,
              completed: true,
            };
            useWorkoutStore.setState({ exercises: updated });
            nextExercise();
          }}
        >
          <Text style={styles.skipSet}>Skip this set</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Progress
  progressBar: {
    height: 4,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  // Exercise section
  exerciseSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  muscles: {
    ...typography.body,
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  equipment: {
    ...typography.caption,
    textAlign: 'center',
  },
  // Set section
  setSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  setLabel: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  repsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  repAdjust: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  repAdjustText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.accent,
  },
  repsValue: {
    fontSize: 56,
    fontWeight: '700',
    color: colors.text,
    minWidth: 80,
    textAlign: 'center',
  },
  repsLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  // Complete button
  completeButton: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.bg,
  },
  // Rest
  restButton: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  restButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  restActive: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  restCountdown: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  skipRest: {
    ...typography.body,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  // Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.xxl,
  },
  skipSet: {
    ...typography.caption,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
