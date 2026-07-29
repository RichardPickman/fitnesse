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
import { softCap } from '../utils/computeBodyMapIntensity';
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
// Constants
// ---------------------------------------------------------------------------

/** Gradient stops used by both `intensityToColor` and the legend */
const GRADIENT_STOPS: [number, [number, number, number]][] = [
  [0.0, [59, 130, 246]],   // blue
  [0.3, [74, 222, 128]],   // green
  [0.6, [250, 204, 21]],   // yellow
  [1.0, [239, 68, 68]],    // red
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map a raw intensity to a blue→green→red gradient.
 *
 * First applies soft-cap to get a 0–1 display value, then interpolates
 * through the GRADIENT_STOPS.
 */
function intensityToColor(rawIntensity: number): string {
  if (rawIntensity <= 0) {
    return 'transparent';
  }

  const t = softCap(rawIntensity);

  return interpolateColor(t);
}

/**
 * Interpolate a 0–1 value through the gradient stops.
 */
function interpolateColor(t: number): string {
  const stops = GRADIENT_STOPS;

  // Find the two stops we're between
  let lower = stops[0];
  let upper = stops[stops.length - 1];

  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lower = stops[i];
      upper = stops[i + 1];
      break;
    }
  }

  // Interpolate between lower and upper
  const range = upper[0] - lower[0];
  const fraction = range === 0 ? 0 : (t - lower[0]) / range;

  const r = Math.round(lower[1][0] + (upper[1][0] - lower[1][0]) * fraction);
  const g = Math.round(lower[1][1] + (upper[1][1] - lower[1][1]) * fraction);
  const b = Math.round(lower[1][2] + (upper[1][2] - lower[1][2]) * fraction);

  return `rgb(${r}, ${g}, ${b})`;
}

// ---------------------------------------------------------------------------
// Gradient Legend
// ---------------------------------------------------------------------------

const LEGEND_BAR_SEGMENTS = 20;

const GradientLegend = () => {
  const segments = Array.from({ length: LEGEND_BAR_SEGMENTS }, (_, i) => {
    const t = i / (LEGEND_BAR_SEGMENTS - 1);

    return { key: i, color: interpolateColor(t) };
  });

  return (
    <View style={styles.legendContainer}>
      <Text style={styles.legendLabel}>Low</Text>
      <View style={styles.legendBar}>
        {segments.map((seg) => (
          <View
            key={seg.key}
            style={[styles.legendSegment, { backgroundColor: seg.color }]}
          />
        ))}
      </View>
      <Text style={styles.legendLabel}>High</Text>
    </View>
  );
};

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
      <GradientLegend />
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
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  legendBar: {
    flex: 1,
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  legendSegment: {
    flex: 1,
  },
  legendLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
});
