import type { Exercise, MuscleGroup, MuscleMapping } from '../db/exercises/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BodyMapIntensityResult {
  /** Zone key → raw intensity (unbounded, can exceed 1.0) */
  muscleIntensity: Record<string, number>;
  /** Whether any muscle has intensity > 0 */
  hasIntensity: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DIFFICULTY_WEIGHTS: Record<Exercise['difficulty'], number> = {
  beginner: 0.3,
  intermediate: 0.6,
  advanced: 1.0,
};

const ROLE_MULTIPLIERS: Record<string, number> = {
  primary: 1.0,
  secondary: 0.5,
};

// ---------------------------------------------------------------------------
// Pure computation (not a React hook — call it anywhere)
// ---------------------------------------------------------------------------

/**
 * Compute body map intensity from a list of selected exercises.
 *
 * For each exercise:
 * - Look up its difficulty → weight (beginner: 0.3, intermediate: 0.6, advanced: 1.0)
 * - Primary muscle groups → multiply by 1.0, secondary → multiply by 0.5
 *
 * Intensities **sum** across multiple exercises targeting the same zone.
 * The result is unbounded — use `softCap()` before mapping to colors.
 */
export function computeBodyMapIntensity(
  exercises: Exercise[],
  muscleGroups: MuscleGroup[],
  mappings: MuscleMapping[],
): BodyMapIntensityResult {
  const muscleIntensity: Record<string, number> = {};

  for (const exercise of exercises) {
    const difficultyWeight = DIFFICULTY_WEIGHTS[exercise.difficulty];

    // Find all mappings for this exercise
    const exerciseMappings = mappings.filter(
      (m) => m.exercise_id === exercise.id,
    );

    for (const mapping of exerciseMappings) {
      // Find the muscle group to get its svg_zone_key
      const group = muscleGroups.find((g) => g.id === mapping.muscle_group_id);

      if (!group || !group.svg_zone_key) {
        continue;
      }

      const roleMultiplier = ROLE_MULTIPLIERS[mapping.role] ?? 0.5;
      const intensity = difficultyWeight * roleMultiplier;

      // Sum intensities across exercises (multiple exercises → higher load)
      muscleIntensity[group.svg_zone_key] =
        (muscleIntensity[group.svg_zone_key] ?? 0) + intensity;
    }
  }

  const hasIntensity = Object.values(muscleIntensity).some((v) => v > 0);

  return { muscleIntensity, hasIntensity };
}

/**
 * Soft-cap an unbounded raw intensity to a 0–1 display value.
 *
 * Formula: 1 - (1 / (raw + 1))
 *
 * Examples:
 *   raw 0.0 → 0.00   raw 1.0 → 0.50   raw 3.0 → 0.75
 *   raw 0.3 → 0.23   raw 2.0 → 0.67   raw 10.0 → 0.91
 */
export function softCap(raw: number): number {
  if (raw <= 0) {
    return 0;
  }

  return 1 - (1 / (raw + 1));
}
