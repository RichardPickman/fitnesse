import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, spacing, typography } from '../theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ExerciseConfigPopoverProps {
  visible: boolean;
  exerciseName: string;
  initialSets: number;
  initialReps: number;
  initialRest: number;
  onConfirm: (sets: number, reps: number, rest: number) => void;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ConfigInputProps {
  text: string | number;
  val: string;
  onChange: (text: string) => void;
}

const ConfigInput = ({ text, val, onChange }: ConfigInputProps) => {
  return (
    <>
      <Text style={styles.label}>{text}</Text>
      <TextInput
        style={styles.input}
        value={val}
        onChangeText={onChange}
        keyboardType="number-pad"
        selectTextOnFocus
        placeholderTextColor={colors.textMuted}
      />
    </>
  )
}

export const ExerciseConfigPopover = ({
  visible,
  exerciseName,
  initialSets,
  initialReps,
  initialRest,
  onConfirm,
  onCancel,
}: ExerciseConfigPopoverProps) => {
  const [sets, setSets] = useState(String(initialSets));
  const [reps, setReps] = useState(String(initialReps));
  const [rest, setRest] = useState(String(initialRest));

  const handleConfirm = () => {
    const parsedSets = parseInt(sets, 10);
    const parsedReps = parseInt(reps, 10);
    const parsedRest = parseInt(rest, 10);

    onConfirm(
      isNaN(parsedSets) || parsedSets < 1 ? initialSets : parsedSets,
      isNaN(parsedReps) || parsedReps < 1 ? initialReps : parsedReps,
      isNaN(parsedRest) || parsedRest < 1 ? initialRest : parsedRest,
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Configure</Text>
          <Text style={styles.exerciseName}>{exerciseName}</Text>

          {/* Sets */}
          <ConfigInput text={'Sets'} val={sets} onChange={setSets} />

          {/* Reps */}
          <ConfigInput text={'Reps'} val={reps} onChange={setReps} />

          {/* Rest seconds */}
          <ConfigInput text={'Rest (seconds)'} val={rest} onChange={setRest} />

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 320,
  },
  title: {
    ...typography.subtitle,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  exerciseName: {
    ...typography.body,
    color: colors.accent,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  confirmButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  confirmText: {
    ...typography.body,
    color: colors.bg,
    fontWeight: '600',
  },
});
