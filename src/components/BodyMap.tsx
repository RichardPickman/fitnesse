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
  // ── Front view ──────────────────────────────────────────────────────────
  // Head — oval with jaw taper
  { id: 'head', d: 'M78,12 C78,-2 122,-2 122,12 C122,28 112,38 108,42 C106,44 104,46 100,46 C96,46 94,44 92,42 C88,38 78,28 78,12 Z', view: 'front' },
  // Neck — trapezius connection
  { id: 'neck', d: 'M88,46 L92,62 L108,62 L112,46 Z', view: 'front' },
  // Shoulders — rounded deltoid caps
  { id: 'shoulders', d: 'M38,70 C36,64 42,60 52,64 L148,64 C158,60 164,64 162,70 C160,76 152,80 145,78 L55,78 C48,80 40,76 38,70 Z', view: 'front' },
  // Chest — pectoral volume, wider at top tapering to sternum
  { id: 'chest', d: 'M52,68 C52,90 58,108 68,118 L72,120 L128,120 L132,118 C142,108 148,90 148,68 C145,72 140,74 135,72 L65,72 C60,74 55,72 52,68 Z', view: 'front' },
  // Abs — segmented rectangular block with slight taper
  { id: 'abs', d: 'M74,122 C72,140 74,160 78,178 L80,184 L120,184 L122,178 C126,160 128,140 126,122 C120,126 115,128 110,126 L90,126 C85,128 80,126 74,122 Z', view: 'front' },
  // Biceps Left — curved arm volume
  { id: 'biceps-l', d: 'M38,70 C28,88 26,108 30,128 L34,132 L48,128 L50,124 C48,108 50,90 55,72 C50,74 44,74 38,70 Z', view: 'front' },
  // Biceps Right
  { id: 'biceps-r', d: 'M162,70 C172,88 174,108 170,128 L166,132 L152,128 L150,124 C152,108 150,90 145,72 C150,74 156,74 162,70 Z', view: 'front' },
  // Forearms Left — narrower than biceps
  { id: 'forearms-l', d: 'M30,132 C26,152 26,175 30,198 L34,202 L48,198 L50,194 C48,175 48,152 50,128 C46,130 40,132 34,132 Z', view: 'front' },
  // Forearms Right
  { id: 'forearms-r', d: 'M170,132 C174,152 174,175 170,198 L166,202 L152,198 L150,194 C152,175 152,152 150,128 C154,130 160,132 166,132 Z', view: 'front' },
  // Hands Left
  { id: 'hands-l', d: 'M30,202 C26,212 28,220 34,224 L44,222 L48,218 C48,212 48,206 48,198 C44,200 38,202 34,202 Z', view: 'front' },
  // Hands Right
  { id: 'hands-r', d: 'M170,202 C174,212 172,220 166,224 L156,222 L152,218 C152,212 152,206 152,198 C156,200 162,202 166,202 Z', view: 'front' },
  // Quads — teardrop shapes
  { id: 'quads', d: 'M80,186 C76,210 76,240 78,270 L80,282 L120,282 L122,270 C124,240 124,210 120,186 C115,192 110,194 105,192 L95,192 C90,194 85,192 80,186 Z', view: 'front' },
  // Calves — diamond/teardrop shapes
  { id: 'calves', d: 'M80,310 C76,330 76,355 80,380 L82,392 L118,392 L120,380 C124,355 124,330 120,310 C115,316 110,318 105,316 L95,316 C90,318 85,316 80,310 Z', view: 'front' },
  // Feet
  { id: 'feet', d: 'M76,394 C72,406 74,416 80,420 L120,420 C126,416 128,406 124,394 C118,398 112,400 106,398 L94,398 C88,400 82,398 76,394 Z', view: 'front' },
  // Hips / groin area
  { id: 'hips', d: 'M78,184 C74,192 76,198 82,202 L118,202 C124,198 126,192 122,184 C116,188 110,190 104,188 L96,188 C90,190 84,188 78,184 Z', view: 'front' },

  // ── Back view ───────────────────────────────────────────────────────────
  // Traps — diamond-shaped upper back
  { id: 'traps', d: 'M38,70 C42,58 50,54 60,58 L140,58 C150,54 158,58 162,70 C155,66 148,64 140,66 L60,66 C52,64 45,66 38,70 Z', view: 'back' },
  // Rear Delts Left
  { id: 'rear-delts', d: 'M38,72 C28,82 26,98 30,112 L34,116 L48,112 L50,108 C48,98 50,84 55,74 C50,76 44,76 38,72 Z', view: 'back' },
  // Rear Delts Right
  { id: 'rear-delts-r', d: 'M162,72 C172,82 174,98 170,112 L166,116 L152,112 L150,108 C152,98 150,84 145,74 C150,76 156,76 162,72 Z', view: 'back' },
  // Lats Left — wing-shaped flare
  { id: 'lats', d: 'M55,72 C48,90 46,110 50,132 L54,142 L70,146 L72,140 C72,120 74,100 72,78 C68,80 62,80 55,72 Z', view: 'back' },
  // Lats Right
  { id: 'lats-r', d: 'M145,72 C152,90 154,110 150,132 L146,142 L130,146 L128,140 C128,120 126,100 128,78 C132,80 138,80 145,72 Z', view: 'back' },
  // Lower back / spinal erectors
  { id: 'lower-back', d: 'M74,144 C72,160 74,175 78,184 L80,186 L120,186 L122,184 C126,175 128,160 126,144 C120,148 115,150 110,148 L90,148 C85,150 80,148 74,144 Z', view: 'back' },
  // Triceps Left — horseshoe shape
  { id: 'triceps-l', d: 'M30,116 C26,132 26,150 30,164 L34,168 L48,164 L50,160 C48,150 48,132 50,112 C46,114 40,116 34,116 Z', view: 'back' },
  // Triceps Right
  { id: 'triceps-r', d: 'M170,116 C174,132 174,150 170,164 L166,168 L152,164 L150,160 C152,150 152,132 150,112 C154,114 160,116 166,116 Z', view: 'back' },
  // Glutes — rounded oval volume
  { id: 'glutes', d: 'M74,188 C70,206 72,218 80,224 L120,224 C128,218 130,206 126,188 C120,194 114,196 108,194 L92,194 C86,196 80,194 74,188 Z', view: 'back' },
  // Hamstrings — elongated rear thigh
  { id: 'hamstrings', d: 'M80,226 C76,250 76,275 78,300 L80,312 L120,312 L122,300 C124,275 124,250 120,226 C115,232 110,234 105,232 L95,232 C90,234 85,232 80,226 Z', view: 'back' },
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
