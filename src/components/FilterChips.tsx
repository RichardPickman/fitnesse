import type { MuscleGroup } from '@/db/exercises/types';
import { colors, spacing, typography } from '@/theme';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Chip {
  id: string | null;
  name: string;
}

interface FilterChipsProps {
  muscleGroups: Chip[];
  filterGroup: string | null;
  onFilterChange: (id: string | null) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const FilterChips = ({ muscleGroups, filterGroup, onFilterChange }: FilterChipsProps) => {
  const items: Chip[] = [{id: null, name: 'All'}, ...muscleGroups];
  return (
    <ScrollView horizontal style={styles.row} showsHorizontalScrollIndicator={false}>
      {items.map((mg) => {
        console.log(mg);

        return (
        <TouchableOpacity
          key={mg.id ?? 'all'}
          style={[styles.chip, filterGroup === mg.id && styles.chipActive]}
          onPress={() => onFilterChange(mg.id === filterGroup ? null : mg.id)}
        >
          <Text style={[styles.label, filterGroup === mg.id && styles.labelActive]}>
            {mg.name}
          </Text>
        </TouchableOpacity>
      )
      })}
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  row: {
    flexShrink: 0,
    flexGrow: 0,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '18',
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: colors.accent,
  },
});
