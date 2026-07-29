import type { MuscleGroup, MuscleMapping } from '../db/exercises';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BodyMapIntensityResult {
  /** Zone key → intensity 0–1 */
  muscleIntensity: Record<string, number>;
  /** Whether any muscle has intensity > 0 */
  hasIntensity: boolean;
}

// ---------------------------------------------------------------------------
// Pure computation (not a React hook — call it anywhere)
// ---------------------------------------------------------------------------

/**
 * Compute body map intensity from a list of exercise IDs.
 *
 * For each exercise:
 * - Primary muscle groups → intensity 1.0
 * - Secondary muscle groups → intensity 0.5
 *
 * When multiple exercises target the same zone, the highest intensity wins.
 */
export function computeBodyMapIntensity(
  exerciseIds: string[],
  muscleGroups: MuscleGroup[],
  mappings: MuscleMapping[],
): BodyMapIntensityResult {
  const muscleIntensity: Record<string, number> = {};

  for (const exerciseId of exerciseIds) {
    // Find all mappings for this exercise
    const exerciseMappings = mappings.filter(
      (m) => m.exercise_id === exerciseId,
    );

    for (const mapping of exerciseMappings) {
      // Find the muscle group to get its svg_zone_key
      const group = muscleGroups.find((g) => g.id === mapping.muscle_group_id);

      if (!group || !group.svg_zone_key) {
        continue;
      }

      const intensity = mapping.role === 'primary' ? 1.0 : 0.5;
      const current = muscleIntensity[group.svg_zone_key] ?? 0;

      // Take the highest intensity (primary overrides secondary)
      if (intensity > current) {
        muscleIntensity[group.svg_zone_key] = intensity;
      }
    }
  }

  const hasIntensity = Object.values(muscleIntensity).some((v) => v > 0);

  return { muscleIntensity, hasIntensity };
}
