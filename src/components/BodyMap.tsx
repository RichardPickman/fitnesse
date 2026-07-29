import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { BODY_OUTLINE_IDS, MUSCLE_PATHS } from '../assets/body-paths';
import { colors, spacing, typography } from '../theme';
import { SVG_ID_TO_ZONE_KEY } from '../utils/muscle-mapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BodyMapProps {
  /** Zone key → intensity 0–1 (0 = no highlight, 1 = full highlight) */
  muscleIntensity?: Record<string, number>;
  /** Show as collapsible accordion (default: false) */
  collapsible?: boolean;
  /** Start expanded when collapsible (default: true) */
  defaultExpanded?: boolean;
  /** Width of each body view (front/back) in px (default: 140) */
  size?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function intensityToColor(intensity: number): string {
  if (intensity <= 0) {
    return 'transparent';
  }
  // Scale from transparent to accent color
  const alpha = Math.min(intensity * 0.6, 0.6);

  return `rgba(74, 222, 128, ${alpha})`;
}

// ---------------------------------------------------------------------------
// Body SVG component
// ---------------------------------------------------------------------------

interface BodySvgProps {
  view: 'front' | 'back';
  muscleIntensity: Record<string, number>;
  size: number;
}

const BodySvg = ({ view, muscleIntensity, size }: BodySvgProps) => {
  const paths = MUSCLE_PATHS.filter((p) => p.view === view);

  return (
    <Svg width={size} height={size * 2.5} viewBox="0 0 676.49 1203.49">
      {paths.map((zone) => {
        const isOutline = BODY_OUTLINE_IDS.includes(zone.id);
        const zoneKey = SVG_ID_TO_ZONE_KEY[zone.id];
        const intensity = zoneKey ? (muscleIntensity[zoneKey] ?? 0) : 0;
        const fillColor = isOutline ? 'transparent' : intensityToColor(intensity);

        return (
          <Path
            key={zone.id}
            id={zone.id}
            d={zone.d}
            stroke={isOutline ? '#484a68' : '#555'}
            strokeWidth={isOutline ? 1.5 : 1}
            fill={fillColor}
            fillOpacity={isOutline ? 0 : intensity > 0 ? 1 : 0}
          />
        );
      })}
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const BodyMap = ({
  muscleIntensity = {},
  collapsible = false,
  defaultExpanded = false,
  size = 140,
}: BodyMapProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasIntensity = Object.values(muscleIntensity).some((v) => v > 0);

  const content = (
    <View style={styles.content}>
      <View style={styles.row}>
        <View style={styles.figure}>
          <BodySvg view="front" muscleIntensity={muscleIntensity} size={size} />
          <Text style={styles.label}>Front</Text>
        </View>
        <View style={styles.figure}>
          <BodySvg view="back" muscleIntensity={muscleIntensity} size={size} />
          <Text style={styles.label}>Back</Text>
        </View>
      </View>
      {!hasIntensity && (
        <Text style={styles.hint}>Add exercises to see muscle highlights</Text>
      )}
    </View>
  );

  if (!collapsible) {
    return <View style={styles.container}>{content}</View>;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.accordionTitle}>Muscle Map</Text>
        <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {expanded && content}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  content: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  figure: {
    alignItems: 'center',
  },
  label: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  accordionTitle: {
    ...typography.subtitle,
    fontSize: 15,
  },
  chevron: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
