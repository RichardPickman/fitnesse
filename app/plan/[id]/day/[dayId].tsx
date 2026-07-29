import { BodyMap } from '@/components/BodyMap';
import { ExerciseConfigPopover } from '@/components/ExerciseConfigPopover';
import { ExercisePickerList } from '@/components/ExercisePickerList';
import { FilterChips } from '@/components/FilterChips';
import { DAY_LABELS, getEntriesForDay } from '@/db/plans';
import { useDayEditorState, useMuscleSearch } from '@/hooks/useDayEditorState';
import { useExerciseStore } from '@/stores/exerciseStore';
import { usePlanStore } from '@/stores/planStore';
import { colors, spacing, typography } from '@/theme';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DayEditorScreen() {
  const { id: planId, dayId } = useLocalSearchParams<{ id: string; dayId: string }>();
  const { plans, loadPlans } = usePlanStore();
  const { exercises, muscleGroups, mappings, getMusclesForExercise, loadLibrary } = useExerciseStore();

  const plan = plans.find((p) => p.plan.id === planId);
  const day = plan?.days.find((d) => d.id === dayId);
  const dayIndex = day?.day_of_week ?? 0;
  const {
    search,
    filterGroup,
    filteredExercises,
    setSearch,
    setFilterGroup,
  } = useMuscleSearch({
    exercises,
    mappings
  })

  const {
    saving,
    configPopover,
    bodyMapIntensity,
    entries,
    selectedIds,
    handleToggle,
    handleConfigConfirm,
    handleSave,
    setConfigPopover,
    loadInitialData,
  } = useDayEditorState({
    dayId: dayId ?? '',
    muscleGroups,
    mappings,
  });

  // Load entries on focus
  useFocusEffect(
    useCallback(() => {
      loadPlans();
      loadLibrary();
      if (dayId) {
        getEntriesForDay(dayId).then(loadInitialData);
      }
    }, [dayId]),
  );

  const getExercisePrimaryMuscles = (exerciseId: string): string =>
    getMusclesForExercise(exerciseId).primary.map((m) => m.name).join(', ');

  if (!day) {
    return (
      <View style={styles.container}>
        <View style={styles.centered}>
          <Text style={{ color: colors.textSecondary }}>Day not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back}>
          <Text style={styles.backButton}>← {plan?.plan.name ?? 'Plan'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{DAY_LABELS[dayIndex]}</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Body map */}
      <BodyMap muscleIntensity={bodyMapIntensity} size={100} />

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search exercises..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* Muscle group filter chips */}
      <FilterChips
        muscleGroups={muscleGroups.map((item) => ({ id: item.id, name: item.name }))}
        filterGroup={filterGroup}
        onFilterChange={setFilterGroup}
      />

      <ExercisePickerList
        exercises={filteredExercises}
        selectedIds={selectedIds}
        entries={entries}
        onToggle={handleToggle}
        getExercisePrimaryMuscles={getExercisePrimaryMuscles}
      />

      {/* Config popover */}
      {configPopover && (
        <ExerciseConfigPopover
          visible
          exerciseName={configPopover.exerciseName}
          initialSets={3}
          initialReps={10}
          initialRest={90}
          onConfirm={(sets, reps, rest) =>
            handleConfigConfirm(configPopover.exerciseId, sets, reps, rest)
          }
          onCancel={() => setConfigPopover(null)}
        />
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    ...typography.subtitle,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  saveButton: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  searchInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listWrapper: {
    flex: 1,
  },
});
