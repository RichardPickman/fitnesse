import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Modal,
} from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { usePlanStore } from '@/stores/planStore';
import { useExerciseStore } from '@/stores/exerciseStore';
import {
  getEntriesForDay,
  addExerciseToDay,
  removeExerciseFromDay,
  DAY_LABELS,
  type PlanExerciseEntry,
} from '@/db/plans';
import type { Exercise } from '@/db/exercises';

export default function DayEditorScreen() {
  const { id: planId, dayId } = useLocalSearchParams<{ id: string; dayId: string }>();
  const { plans, loadPlans } = usePlanStore();
  const { exercises, muscleGroups, mappings, getMusclesForExercise, loadLibrary } = useExerciseStore();

  const plan = plans.find((p) => p.plan.id === planId);
  const day = plan?.days.find((d) => d.id === dayId);
  const dayIndex = day?.day_of_week ?? 0;

  const [entries, setEntries] = useState<PlanExerciseEntry[]>([]);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);

  // Load entries on focus
  useFocusEffect(
    useCallback(() => {
      loadPlans();
      loadLibrary();
      if (dayId) {
        getEntriesForDay(dayId).then(setEntries);
      }
    }, [dayId]),
  );

  // Filter exercises based on search + muscle group filter
  const filteredExercises = useMemo(() => {
    let result = exercises;

    // Search by name
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

    // Filter by muscle group
    if (filterGroup) {
      const exerciseIdsForGroup = new Set(
        mappings
          .filter((m) => m.muscle_group_id === filterGroup)
          .map((m) => m.exercise_id),
      );
      result = result.filter((e) => exerciseIdsForGroup.has(e.id));
    }

    return result;
  }, [exercises, search, filterGroup, mappings]);

  const handleAdd = async (exerciseId: string) => {
    if (!dayId) return;
    await addExerciseToDay(dayId, exerciseId, entries.length);
    const updated = await getEntriesForDay(dayId);
    setEntries(updated);
    setPickerVisible(false);
    setSearch('');
  };

  const handleRemove = (entryId: string, exerciseName: string) => {
    Alert.alert(`Remove "${exerciseName}"?`, undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await removeExerciseFromDay(entryId);
        const updated = await getEntriesForDay(dayId!);
        setEntries(updated);
      }},
    ]);
  };

  const getExerciseName = (exerciseId: string): string =>
    exercises.find((e) => e.id === exerciseId)?.name ?? 'Unknown';

  const getExercisePrimaryMuscles = (exerciseId: string): string =>
    getMusclesForExercise(exerciseId).primary.map((m) => m.name).join(', ');

  if (!day) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Day not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← {plan?.plan.name ?? 'Plan'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{DAY_LABELS[dayIndex]}</Text>
        <TouchableOpacity onPress={() => setPickerVisible(true)}>
          <Text style={styles.addButton}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise list */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptyBody}>
              Tap "+ Add" to pick exercises from the library.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.entryCard}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryName}>{getExerciseName(item.exercise_id)}</Text>
              <TouchableOpacity onPress={() => handleRemove(item.id, getExerciseName(item.exercise_id))}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.entryMuscles}>{getExercisePrimaryMuscles(item.exercise_id)}</Text>
            <Text style={styles.entryStats}>
              {item.target_sets}×{item.target_reps} · {item.rest_seconds}s rest
            </Text>
          </View>
        )}
      />

      {/* Exercise Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.pickerContainer}>
          {/* Picker header */}
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Add Exercise</Text>
            <TouchableOpacity onPress={() => setPickerVisible(false)}>
              <Text style={styles.pickerDone}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <TextInput
            style={styles.searchInput}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />

          {/* Muscle group filter chips */}
          <ScrollView horizontal style={styles.filterRow} showsHorizontalScrollIndicator={false}>
            {[{ id: null, name: 'All' } as const, ...muscleGroups].map((mg) => (
              <TouchableOpacity
                key={mg.id ?? 'all'}
                style={[styles.filterChip, filterGroup === mg.id && styles.filterChipActive]}
                onPress={() => setFilterGroup(mg.id === filterGroup ? null : mg.id)}
              >
                <Text style={[styles.filterLabel, filterGroup === mg.id && styles.filterLabelActive]}>
                  {mg.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Exercise list */}
          <FlatList
            data={filteredExercises}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => handleAdd(item.id)}
              >
                <View style={styles.pickerItemInfo}>
                  <Text style={styles.pickerItemName}>{item.name}</Text>
                  <Text style={styles.pickerItemTags}>
                    {item.equipment_tags.join(', ')} · {item.difficulty}
                  </Text>
                </View>
                <Text style={styles.pickerItemMuscles}>
                  {getExercisePrimaryMuscles(item.id)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
  headerTitle: {
    ...typography.subtitle,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  addButton: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
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
  entryCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  entryName: {
    ...typography.subtitle,
    fontSize: 16,
  },
  removeButton: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: spacing.sm,
  },
  entryMuscles: {
    ...typography.caption,
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  entryStats: {
    ...typography.caption,
  },
  // Picker
  pickerContainer: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  pickerTitle: {
    ...typography.subtitle,
    fontSize: 20,
  },
  pickerDone: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
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
  filterRow: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterChip: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '18',
  },
  filterLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterLabelActive: {
    color: colors.accent,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pickerItemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pickerItemName: {
    ...typography.body,
    fontWeight: '600',
  },
  pickerItemTags: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
  },
  pickerItemMuscles: {
    ...typography.caption,
    color: colors.accentDim,
    fontSize: 12,
  },
});
