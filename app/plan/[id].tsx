import { BodyMap } from '@/components/BodyMap';
import type { Exercise } from '@/db/exercises';
import { DAY_LABELS, type PlanWithDays } from '@/db/plans';
import { useExerciseStore } from '@/stores/exerciseStore';
import { usePlanStore } from '@/stores/planStore';
import { colors, spacing, typography } from '@/theme';
import { computeBodyMapIntensity } from '@/utils/computeBodyMapIntensity';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, loadPlans, removePlan } = usePlanStore();
  const { exercises, muscleGroups, mappings } = useExerciseStore();
  const plan = plans.find((p) => p.plan.id === id) ?? null;

  // Reload on focus in case edits happened
  useFocusEffect(
    useCallback(() => {
      loadPlans();
    }, []),
  );

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Plan not found</Text>
          <TouchableOpacity onPress={router.back}>
            <Text style={styles.backLink}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert(
      `Delete "${plan.plan.name}"?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await removePlan(plan.plan.id);
            router.back();
          },
        },
      ],
    );
  };

  const formatDays = (p: PlanWithDays): string => {
    return p.days.map((d) => DAY_LABELS[d.day_of_week]).join(', ');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back}>
          <Text style={styles.backButton}>← Plans</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() =>
              router.push(`/plan/${plan.plan.id}/edit`)
            }
          >
            <Text style={styles.editButton}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Plan info */}
        <Text style={styles.planName}>{plan.plan.name}</Text>
        {plan.plan.description && (
          <Text style={styles.planDescription}>{plan.plan.description}</Text>
        )}

        {/* Days */}
        <Text style={styles.sectionTitle}>Training Days</Text>
        <Text style={styles.daysValue}>{formatDays(plan)}</Text>

        {/* Per-day exercise sections */}
        {plan.days.map((day) => (
          <View key={day.id} style={styles.daySection}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayTitle}>{DAY_LABELS[day.day_of_week]}</Text>
              <TouchableOpacity
                onPress={() => router.push(`/plan/${plan.plan.id}/day/${day.id}`)}
              >
                <Text style={styles.addExerciseLink}>
                  {day.entries.length > 0
                    ? `${day.entries.length} exercise${day.entries.length !== 1 ? 's' : ''} · Edit`
                    : '+ Add exercises'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Body map for this day */}
            {day.entries.length > 0 && (
              <BodyMap
                collapsible
                muscleIntensity={
                  computeBodyMapIntensity(
                    day.entries
                      .map((e) => exercises.find((ex) => ex.id === e.exercise_id))
                      .filter((ex): ex is Exercise => ex != null),
                    muscleGroups,
                    mappings,
                  ).muscleIntensity
                }
              />
            )}

            {day.entries.length > 0 ? (
              <View style={styles.exerciseList}>
                {day.entries.map((entry) => (
                  <TouchableOpacity
                    key={entry.id}
                    style={styles.exerciseRow}
                    onPress={() => router.push(`/plan/${plan.plan.id}/day/${day.id}`)}
                  >
                    <Text style={styles.exerciseName}>
                      {exercises.find((e) => e.id === entry.exercise_id)?.name ?? 'Unknown'}
                    </Text>
                    <Text style={styles.exerciseStats}>
                      {entry.target_sets}×{entry.target_reps}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>
                  No exercises yet. Tap to add.
                </Text>
              </View>
            )}

            {/* Start Workout button */}
            {day.entries.length > 0 && (
              <TouchableOpacity
                style={styles.startWorkoutButton}
                onPress={() =>
                  router.push(`/workout/${plan.plan.id}?dayId=${day.id}`)
                }
              >
                <Text style={styles.startWorkoutText}>▶ Start Workout</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Delete at bottom */}
      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteText}>Delete Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  editButton: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  backLink: {
    color: colors.accent,
    fontSize: 16,
  },
  planName: {
    ...typography.title,
    fontSize: 26,
    marginBottom: spacing.xs,
  },
  planDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  daysValue: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.xl,
  },
  daySection: {
    marginBottom: spacing.xl,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dayTitle: {
    ...typography.subtitle,
    fontSize: 17,
  },
  addExerciseLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyDay: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  emptyDayText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  exerciseList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  exerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  exerciseName: {
    ...typography.body,
  },
  exerciseStats: {
    ...typography.caption,
    color: colors.accent,
  },
  startWorkoutButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  startWorkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.bg,
  },
  deleteButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  deleteText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
});
