import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../src/theme';

export default function HomeScreen() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      {/* Greeting */}
      <Text style={styles.greeting}>Today</Text>
      <Text style={styles.date}>{today}</Text>

      {/* Today's workout card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Rest Day</Text>
        <Text style={styles.cardBody}>
          No workout planned. Create a plan to get started!
        </Text>
      </View>

      {/* Quick stats from last session */}
      <Text style={styles.sectionTitle}>Last Session</Text>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Volume</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>—</Text>
          <Text style={styles.statLabel}>Exercises</Text>
        </View>
      </View>
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
  greeting: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  date: {
    ...typography.caption,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    ...typography.subtitle,
    marginBottom: spacing.sm,
  },
  cardBody: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  sectionTitle: {
    ...typography.subtitle,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
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
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.caption,
  },
});
