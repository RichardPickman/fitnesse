import { StyleSheet, Text, View } from 'react-native';
import Svg, { Ellipse, Path } from 'react-native-svg';
import { colors, spacing, typography } from '../theme';
import { ALL_ZONE_KEYS, ZONE_KEY_TO_SVG_ID, zoneKeyToView } from '../utils/muscle-mapping';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BodyMapProps {
  /** Zone key → intensity 0–1 (0 = no highlight, 1 = full highlight) */
  muscleIntensity?: Record<string, number>;
}

// ---------------------------------------------------------------------------
// SVG path data for each zone
// ---------------------------------------------------------------------------

interface ZonePath {
  id: string;
  d: string;
  view: 'front' | 'back';
}

const ZONE_PATHS: ZonePath[] = [
  // Front view
  { id: 'head', d: 'M78,9 A22,26 0 1,1 122,9 A22,26 0 1,1 78,9', view: 'front' },
  { id: 'neck', d: 'M90,58 Q100,68 110,58', view: 'front' },
  { id: 'shoulders', d: 'M40,72 Q42,65 55,68 L145,68 Q158,65 160,72', view: 'front' },
  { id: 'chest', d: 'M55,72 Q55,110 70,120 L130,120 Q145,110 145,72', view: 'front' },
  { id: 'abs', d: 'M72,122 Q72,170 80,185 L120,185 Q128,170 128,122', view: 'front' },
  { id: 'biceps-l', d: 'M40,72 Q30,100 32,130 L48,128 Q46,100 55,72', view: 'front' },
  { id: 'biceps-r', d: 'M160,72 Q170,100 168,130 L152,128 Q154,100 145,72', view: 'front' },
  { id: 'forearms-l', d: 'M32,132 Q28,170 30,200 L46,198 Q44,170 48,130', view: 'front' },
  { id: 'forearms-r', d: 'M168,132 Q172,170 170,200 L154,198 Q156,170 152,130', view: 'front' },
  { id: 'hands-l', d: 'M30,202 Q28,215 32,220 L44,218 Q46,210 46,200', view: 'front' },
  { id: 'hands-r', d: 'M170,202 Q172,215 168,220 L156,218 Q154,210 154,200', view: 'front' },
  { id: 'quads', d: 'M82,187 Q78,230 80,280 L120,280 Q122,230 118,187', view: 'front' },
  { id: 'calves', d: 'M82,310 Q78,350 80,390 L120,390 Q122,350 118,310', view: 'front' },
  { id: 'feet', d: 'M75,392 Q72,410 78,415 L122,415 Q128,410 125,392', view: 'front' },
  { id: 'hips', d: 'M80,185 Q75,195 82,200 L118,200 Q125,195 120,185', view: 'front' },

  // Back view
  { id: 'traps', d: 'M40,72 Q42,60 55,65 L145,65 Q158,60 160,72', view: 'back' },
  { id: 'rear-delts', d: 'M40,74 Q30,85 32,100 L48,98 Q46,85 55,74', view: 'back' },
  { id: 'rear-delts-r', d: 'M160,74 Q170,85 168,100 L152,98 Q154,85 145,74', view: 'back' },
  { id: 'lats', d: 'M55,74 Q50,110 55,140 L70,145 Q70,110 72,74', view: 'back' },
  { id: 'lats-r', d: 'M145,74 Q150,110 145,140 L130,145 Q130,110 128,74', view: 'back' },
  { id: 'lower-back', d: 'M72,142 Q72,175 80,185 L120,185 Q128,175 128,142', view: 'back' },
  { id: 'triceps-l', d: 'M32,102 Q28,130 30,155 L46,153 Q44,130 48,100', view: 'back' },
  { id: 'triceps-r', d: 'M168,102 Q172,130 170,155 L154,153 Q156,130 152,100', view: 'back' },
  { id: 'glutes', d: 'M72,187 Q70,210 78,220 L122,220 Q130,210 128,187', view: 'back' },
  { id: 'hamstrings', d: 'M80,222 Q78,260 80,310 L120,310 Q122,260 120,222', view: 'back' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getIntensityForZone(
  zoneId: string,
  muscleIntensity: Record<string, number>,
): number {
  // Find which zone key maps to this SVG id
  for (const [zoneKey, svgId] of Object.entries(ZONE_KEY_TO_SVG_ID)) {
    if (svgId === zoneId) {
      return muscleIntensity[zoneKey] ?? 0;
    }
  }
  return 0;
}

function intensityToColor(intensity: number): string {
  if (intensity <= 0) return 'transparent';
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
  const paths = ZONE_PATHS.filter((p) => p.view === view);

  return (
    <Svg width={size} height={size * 2.5} viewBox="0 0 200 500">
      {paths.map((zone) => {
        const intensity = getIntensityForZone(zone.id, muscleIntensity);
        const fillColor = intensityToColor(intensity);

        return (
          <Path
            key={zone.id}
            id={zone.id}
            d={zone.d}
            stroke="#555"
            strokeWidth={1.5}
            fill={fillColor}
            fillOpacity={intensity > 0 ? 1 : 0}
          />
        );
      })}
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const BodyMap = ({ muscleIntensity = {} }: BodyMapProps) => {
  const hasIntensity = Object.values(muscleIntensity).some((v) => v > 0);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.figure}>
          <BodySvg view="front" muscleIntensity={muscleIntensity} size={140} />
          <Text style={styles.label}>Front</Text>
        </View>
        <View style={styles.figure}>
          <BodySvg view="back" muscleIntensity={muscleIntensity} size={140} />
          <Text style={styles.label}>Back</Text>
        </View>
      </View>
      {!hasIntensity && (
        <Text style={styles.hint}>Add exercises to see muscle highlights</Text>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
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
});
