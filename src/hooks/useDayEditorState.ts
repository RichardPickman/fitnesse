import type { Exercise, MuscleGroup, MuscleMapping } from '@/db/exercises';
import {
  addExerciseToDay,
  removeExerciseFromDay,
  updateExerciseEntry,
  type PlanExerciseEntry,
} from '@/db/plans';
import { computeBodyMapIntensity } from '@/utils/computeBodyMapIntensity';
import { router } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PendingConfig {
  exerciseId: string;
  exerciseName: string;
}

interface UseDayEditorStateOptions {
  dayId: string;
  exercises: Exercise[];
  muscleGroups: MuscleGroup[];
  mappings: MuscleMapping[];
}

interface UseDayEditorStateReturn {
  // Data
  entries: PlanExerciseEntry[];
  selectedIds: string[];
  saving: boolean;
  configPopover: PendingConfig | null;

  // Computed
  bodyMapIntensity: Record<string, number>;

  // Actions
  isSelected: (exerciseId: string) => boolean;
  getExistingEntry: (exerciseId: string) => PlanExerciseEntry | undefined;
  handleToggle: (exercise: Exercise) => void;
  handleConfigConfirm: (exerciseId: string, sets: number, reps: number, rest: number) => void;
  handleSave: () => Promise<void>;
  setConfigPopover: (value: PendingConfig | null) => void;
  loadInitialData: (loaded: PlanExerciseEntry[]) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

interface MuscleSearchProps {
  exercises: Exercise[];
  mappings: MuscleMapping[];
}

export function useMuscleSearch({ exercises, mappings }: MuscleSearchProps) {
  // Search & filter
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string | null>(null);

  const filteredExercises = useMemo(() => {
    let result = exercises;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q));
    }

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

  return {
    search,
    filterGroup,
    filteredExercises,
    setSearch,
    setFilterGroup,
  }
} 

export function useDayEditorState({
  dayId,
  exercises,
  muscleGroups,
  mappings,
}: UseDayEditorStateOptions): UseDayEditorStateReturn {
  // Existing entries loaded from DB
  const [entries, setEntries] = useState<PlanExerciseEntry[]>([]);
  // Local set of selected exercise IDs (toggled on/off)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Config popover state
  const [configPopover, setConfigPopover] = useState<PendingConfig | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);

  // Pending configs for newly added exercises (not yet saved)
  const pendingConfigs = useRef<Map<string, { sets: number; reps: number; rest: number }>>(new Map());

  // Load initial data into state
  const loadInitialData = useCallback((loaded: PlanExerciseEntry[]) => {
    setEntries(loaded);
    const ids = loaded.map((e) => e.exercise_id);
    setSelectedIds(ids);
  }, []);

  // Compute body map intensity from local selection
  const bodyMapIntensity = useMemo(
    () => {
      const selectedExercises = exercises.filter((ex) =>
        selectedIds.includes(ex.id),
      );

      return computeBodyMapIntensity(
        selectedExercises,
        muscleGroups,
        mappings,
      ).muscleIntensity;
    },
    [selectedIds, exercises, muscleGroups, mappings],
  );

  // Check if an exercise is currently selected
  const isSelected = useCallback(
    (exerciseId: string): boolean => selectedIds.includes(exerciseId),
    [selectedIds],
  );

  // Get existing entry for an exercise (if it was already in the day)
  const getExistingEntry = useCallback(
    (exerciseId: string): PlanExerciseEntry | undefined =>
      entries.find((e) => e.exercise_id === exerciseId),
    [entries],
  );

  // Toggle an exercise on/off
  const handleToggle = useCallback(
    (exercise: Exercise) => {
      if (isSelected(exercise.id)) {
        // Deselect — remove from local set
        setSelectedIds((prev) => prev.filter((item) => item !== exercise.id));
      } else {
        // Select — show config popover for new exercises
        const existing = getExistingEntry(exercise.id);
        if (existing) {
          // Already in DB with config — just add to local set
          setSelectedIds((prev) => [...prev, exercise.id]);
        } else {
          // New exercise — show config popover
          setConfigPopover({ exerciseId: exercise.id, exerciseName: exercise.name });
        }
      }
    },
    [isSelected, getExistingEntry],
  );

  // Handle config popover confirm
  const handleConfigConfirm = useCallback(
    (exerciseId: string, sets: number, reps: number, rest: number) => {
      // Add to local selection
      setSelectedIds((prev) => [...prev, exerciseId])
      // Store config temporarily so we can use it on save
      pendingConfigs.current.set(exerciseId, { sets, reps, rest });
      setConfigPopover(null);
    },
    [],
  );

  // Save all changes
  const handleSave = useCallback(async () => {
    if (!dayId || saving) return;

    setSaving(true);

    try {
      // Build a map of existing entries by exercise_id for quick lookup
      const existingByExercise = new Map<string, PlanExerciseEntry>();
      for (const entry of entries) {
        existingByExercise.set(entry.exercise_id, entry);
      }

      const toRemove = entries.filter((entry) => !selectedIds.includes(entry.exercise_id));

      const toAdd = selectedIds.filter((id) => !existingByExercise.has(id));

      // Remove unchecked entries
      for (const entry of toRemove) {
        await removeExerciseFromDay(entry.id);
      }

      // Add new entries (with their configured values)
      for (const exerciseId of toAdd) {
        const config = pendingConfigs.current.get(exerciseId);
        const entryId = await addExerciseToDay(dayId, exerciseId, entries.length + toAdd.indexOf(exerciseId));

        // If we have a custom config, update the entry
        if (config) {
          await updateExerciseEntry(entryId, {
            target_sets: config.sets,
            target_reps: config.reps,
            rest_seconds: config.rest,
          });
        }
      }

      // Clear pending configs
      pendingConfigs.current.clear();

      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }, [dayId, saving, entries, selectedIds]);

  return {
    entries,
    selectedIds,
    saving,
    configPopover,
    bodyMapIntensity,
    isSelected,
    getExistingEntry,
    handleToggle,
    handleConfigConfirm,
    handleSave,
    setConfigPopover,
    loadInitialData,
  };
}
