import type { Exercise } from '@/db/exercises';
import type { PlanExerciseEntry } from '@/db/plans';
import { colors, spacing, typography } from '@/theme';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExercisePickerListProps {
  exercises: Exercise[];
  selectedIds: string[];
  entries: PlanExerciseEntry[];
  onToggle: (exercise: Exercise) => void;
  getExercisePrimaryMuscles: (exerciseId: string) => string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ExercisePickerList = ({
  exercises,
  selectedIds,
  entries,
  onToggle,
  getExercisePrimaryMuscles,
}: ExercisePickerListProps) => {
  const isSelected = (exerciseId: string): boolean => selectedIds.includes(exerciseId);

  const getExistingEntry = (exerciseId: string): PlanExerciseEntry | undefined =>
    entries.find((e) => e.exercise_id === exerciseId);

  return (
      <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      renderItem={({ item }) => {
        const selected = isSelected(item.id);
        const existing = getExistingEntry(item.id);

        return (
          <TouchableOpacity
            style={[styles.row, selected && styles.rowSelected]}
            onPress={() => onToggle(item)}
            activeOpacity={0.7}
          >
            {/* Checkbox indicator */}
            <View style={[styles.checkbox, selected && styles.checkboxActive]}>
              {selected && <Text style={styles.checkmark}>✓</Text>}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={[styles.name, selected && styles.nameSelected]}>
                {item.name}
              </Text>
              <Text style={styles.muscles}>
                {getExercisePrimaryMuscles(item.id)}
              </Text>
              {existing && (
                <Text style={styles.config}>
                  {existing.target_sets}×{existing.target_reps} · {existing.rest_seconds}s rest
                </Text>
              )}
            </View>

            {/* Equipment tags */}
            <View style={styles.tags}>
              {item.equipment_tags.slice(0, 2).map((tag) => (
                <Text key={tag} style={styles.tag}>{tag}</Text>
              ))}
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No exercises found</Text>
          <Text style={styles.emptyBody}>
            Try a different search or filter.
          </Text>
        </View>
      }
    />
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    borderRadius: 8,
  },
  rowSelected: {
    backgroundColor: colors.accent + '0D',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.bg,
    fontSize: 14,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  nameSelected: {
    color: colors.accent,
  },
  muscles: {
    ...typography.caption,
    color: colors.accentDim,
    fontSize: 12,
    marginTop: 2,
  },
  config: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  tags: {
    flexDirection: 'row',
    gap: 4,
    marginLeft: spacing.sm,
  },
  tag: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  emptyState: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  emptyBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
