import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { DAY_LABELS, DAY_LABELS_FULL } from '../../../src/db/plans';
import { usePlanStore } from '../../../src/stores/planStore';
import { colors, spacing, typography } from '../../../src/theme';

export default function EditPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plans, editPlan } = usePlanStore();
  const plan = plans.find((p) => p.plan.id === id) ?? null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (plan) {
      setName(plan.plan.name ?? '');
      setDescription(plan.plan.description ?? '');
      setSelectedDays(plan.days.map((d) => d.day_of_week).sort());
      setReady(true);
    }
  }, [plan?.plan.id]);

  const toggleDay = (index: number) => {
    setSelectedDays((prev) =>
      prev.includes(index)
        ? prev.filter((d) => d !== index)
        : [...prev, index].sort(),
    );
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Give your plan a name.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Days required', 'Select at least one day.');
      return;
    }

    try {
      await editPlan(id, trimmedName, description.trim() || null, selectedDays);
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Failed to save plan.');
    }
  };

  if (!plan) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.textSecondary }}>Plan not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Plan</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.save, !name.trim() && styles.saveDisabled]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Push Pull Legs"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          maxLength={60}
        />

        {/* Description */}
        <Text style={styles.label}>Description (optional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g. My 3-day split"
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          maxLength={200}
        />

        {/* Days of week */}
        <Text style={styles.label}>Training days</Text>
        <Text style={styles.hint}>Select which days you train.</Text>
        <View style={styles.daysGrid}>
          {DAY_LABELS_FULL.map((day, i) => {
            const selected = selectedDays.includes(i);
            return (
              <TouchableOpacity
                key={i}
                style={[styles.dayChip, selected && styles.dayChipSelected]}
                onPress={() => toggleDay(i)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayLabel, selected && styles.dayLabelSelected]}>
                  {DAY_LABELS[i]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  cancel: {
    ...typography.body,
    color: colors.accent,
  },
  save: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  label: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dayChip: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 60,
    alignItems: 'center',
  },
  dayChipSelected: {
    backgroundColor: colors.accent + '20',
    borderColor: colors.accent,
  },
  dayLabel: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dayLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
