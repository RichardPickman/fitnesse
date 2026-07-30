import { useExerciseStore } from '@/stores/exerciseStore';
import { colors, spacing, typography } from '@/theme';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const phases = {
  counting: 'Checking for updates...',
  exercises: 'Downloading exercises...',
  mappings: 'Downloading muscle mappings...',
  saving: 'Saving to local database...',
  done: 'Complete!',
};

export default function SyncScreen() {
  const {
    exercises,
    isSyncing,
    syncProgress,
    lastSyncedAt,
    errorMessage,
    syncFromCloud,
  } = useExerciseStore();

  const exerciseCount = exercises.length;
  const hasSyncedBefore = lastSyncedAt !== null;
  const formattedDate = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleString()
    : null;

  const progressPercent =
    syncProgress && syncProgress.total
      ? Math.round((syncProgress.current / syncProgress.total) * 100)
      : null;

  const phaseLabel = syncProgress?.phase
    ? phases[syncProgress.phase]
    : null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exercise Library</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Status card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Local Library</Text>
        <Text style={styles.cardValue}>{exerciseCount} exercises</Text>
        {formattedDate && (
          <Text style={styles.cardSub}>Last synced: {formattedDate}</Text>
        )}
        {!hasSyncedBefore && (
          <Text style={styles.cardHint}>
            Seed data loaded. Sync to get the full library from the cloud.
          </Text>
        )}
      </View>

      {/* Error */}
      {errorMessage && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      {/* Progress */}
      {isSyncing && (
        <View style={styles.progressCard}>
          <ActivityIndicator size="small" color={colors.accent} />
          <Text style={styles.progressText}>
            {progressPercent !== null
              ? `Syncing... ${progressPercent}%`
              : phaseLabel ?? 'Syncing...'}
          </Text>
          {syncProgress && syncProgress.phase !== 'counting' && (
            <Text style={styles.progressDetail}>
              {syncProgress.current} / {syncProgress.total} item
              {syncProgress.total !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}

      {/* Sync button */}
      <TouchableOpacity
        style={[styles.syncButton, isSyncing && styles.syncButtonDisabled]}
        activeOpacity={0.8}
        disabled={isSyncing}
        onPress={syncFromCloud}
      >
        <Text style={styles.syncButtonText}>
          {isSyncing
            ? 'Syncing...'
            : hasSyncedBefore
              ? 'Check for Updates'
              : 'Sync from Cloud'}
        </Text>
      </TouchableOpacity>

      {/* Info */}
      <Text style={styles.info}>
        Exercises are downloaded from the server in batches. Only new or updated
        exercises are fetched after the first sync.
      </Text>
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
    paddingHorizontal: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  backButton: {
    ...typography.body,
    color: colors.accent,
  },
  headerTitle: {
    ...typography.subtitle,
  },
  headerSpacer: {
    width: 60, // balance the back button width
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.subtitle,
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  cardSub: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  cardHint: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  errorCard: {
    backgroundColor: '#3b1a1a',
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#5c2a2a',
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    fontSize: 13,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
  },
  progressDetail: {
    ...typography.caption,
    color: colors.textMuted,
  },
  syncButton: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  syncButtonDisabled: {
    opacity: 0.5,
  },
  syncButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.bg,
  },
  info: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
});
