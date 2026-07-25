import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../src/theme';

export default function PlansScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plans</Text>

      {/* Empty state */}
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>💪</Text>
        <Text style={styles.emptyTitle}>No plans yet</Text>
        <Text style={styles.emptyBody}>
          Create your first workout plan to start tracking.
        </Text>
      </View>

      {/* FAB-style button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabLabel}>Create New Plan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
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
    paddingHorizontal: spacing.xxl,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fabIcon: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.bg,
  },
  fabLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.bg,
  },
});
