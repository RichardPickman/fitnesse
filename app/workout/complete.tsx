import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, spacing, typography } from '@/theme';
import { useWorkoutStore } from '@/stores/workoutStore';
import { addNotes } from '@/db/workout';

export default function WorkoutCompleteScreen() {
  const { duration, volume, sets, sessionId } = useLocalSearchParams<{
    duration: string;
    volume: string;
    sets: string;
    sessionId: string;
  }>();

  const [notes, setNotes] = useState('');

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const handleDone = async () => {
    if (notes.trim() && sessionId) {
      await addNotes(sessionId, notes.trim());
    }
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Celebration header */}
        <Text style={styles.emoji}>💪</Text>
        <Text style={styles.title}>Workout Complete!</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatDuration(Number(duration) || 0)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{sets || '0'}</Text>
            <Text style={styles.statLabel}>Sets</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{volume || '0'}</Text>
            <Text style={styles.statLabel}>Volume</Text>
          </View>
        </View>

        {/* Notes */}
        <Text style={styles.notesLabel}>How did it feel?</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Optional..."
          placeholderTextColor={colors.textMuted}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={500}
        />

        {/* Photo prompt placeholder */}
        <Text style={styles.photoPrompt}>
          📸 Take a progress photo? (coming soon)
        </Text>
      </View>

      {/* Done button */}
      <TouchableOpacity style={styles.doneButton} onPress={handleDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.title,
    fontSize: 26,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xxl,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
  notesLabel: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  photoPrompt: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  doneButton: {
    marginHorizontal: spacing.lg,
    marginBottom: 40,
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.bg,
  },
});
