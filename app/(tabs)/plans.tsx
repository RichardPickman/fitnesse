import type { PlanWithDays } from '@/db/plans';
import { DAY_LABELS } from '@/db/plans';
import { usePlanStore } from '@/stores/planStore';
import { colors, spacing, typography } from '@/theme';
import { router } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PlansScreen() {
  const { plans, status, loadPlans, removePlan } = usePlanStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  useLayoutEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = (plan: PlanWithDays) => {
    Alert.alert(
      `Delete "${plan.plan.name}"?`,
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(plan.plan.id);
            await removePlan(plan.plan.id);
            setDeleting(null);
          },
        },
      ],
    );
  };

  const formatDays = (plan: PlanWithDays): string => {
    return plan.days
      .map((d) => DAY_LABELS[d.day_of_week])
      .join(', ');
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Plans</Text>
        <TouchableOpacity
          style={styles.syncButton}
          activeOpacity={0.7}
          onPress={() => router.push('/sync')}
        >
          <Text style={styles.syncButtonText}>Sync</Text>
        </TouchableOpacity>
      </View>

      {status === 'loading' && plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyBody}>Loading...</Text>
        </View>
      )}

      {status === 'ready' && plans.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>💪</Text>
          <Text style={styles.emptyTitle}>No plans yet</Text>
          <Text style={styles.emptyBody}>
            Create your first workout plan to start tracking.
          </Text>
        </View>
      )}

      {plans.length > 0 && (
        <FlatList
          data={plans}
          keyExtractor={(item) => item.plan.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.planCard}
              activeOpacity={0.7}
              onLongPress={() => handleDelete(item)}
              onPress={() => router.push(`/plan/${item.plan.id}`)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{item.plan.name}</Text>
                {deleting === item.plan.id && (
                  <Text style={styles.deletingLabel}>Deleting…</Text>
                )}
              </View>
              {item.plan.description && (
                <Text style={styles.planDescription}>{item.plan.description}</Text>
              )}
              <Text style={styles.planDays}>{formatDays(item)}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => router.push('/create-plan')}
      >
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.title,
  },
  syncButton: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
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
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  planName: {
    ...typography.subtitle,
    fontSize: 17,
  },
  deletingLabel: {
    ...typography.caption,
    color: colors.error,
    fontStyle: 'italic',
  },
  planDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  planDays: {
    ...typography.caption,
    color: colors.accent,
    marginTop: spacing.xs,
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
