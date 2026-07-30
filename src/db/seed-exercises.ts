import type { Exercise, MuscleGroup, MuscleMapping } from './exercises/types';

// ---------------------------------------------------------------------------
// Hardcoded muscle groups — these are constants, never fetched from Supabase
// ---------------------------------------------------------------------------

export const SEED_MUSCLE_GROUPS: MuscleGroup[] = [
  { id: 'mg-chest',     parent_id: null, name: 'Chest',     svg_zone_key: 'chest',     sort_order: 1 },
  { id: 'mg-shoulders', parent_id: null, name: 'Shoulders', svg_zone_key: 'shoulders', sort_order: 2 },
  { id: 'mg-back',      parent_id: null, name: 'Back',      svg_zone_key: 'back',      sort_order: 3 },
  { id: 'mg-arms',      parent_id: null, name: 'Arms',      svg_zone_key: 'arms',      sort_order: 4 },
  { id: 'mg-core',      parent_id: null, name: 'Core',      svg_zone_key: 'core',      sort_order: 5 },
  { id: 'mg-legs',      parent_id: null, name: 'Legs',      svg_zone_key: 'legs',      sort_order: 6 },
];

// ---------------------------------------------------------------------------
// Hardcoded seed exercises (bodyweight, no equipment needed)
// ---------------------------------------------------------------------------

export const SEED_EXERCISES: Exercise[] = [
  {
    id: 'ex-pike-pushup',
    name: 'Pike Push-Up',
    description: 'Push-up with hips raised high, targeting shoulders. Progress toward HSPU.',
    equipment_tags: ['bodyweight'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-standard-pushup',
    name: 'Standard Push-Up',
    description: 'Classic push-up, chest and triceps.',
    equipment_tags: ['bodyweight'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-ring-pushup',
    name: 'Ring Push-Up',
    description: 'Push-ups on gymnastic rings, increased instability for deeper chest activation.',
    equipment_tags: ['bodyweight', 'rings'],
    difficulty: 'advanced',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-pullup',
    name: 'Pull-Up',
    description: 'Overhand grip pull-up targeting lats and biceps.',
    equipment_tags: ['bodyweight', 'bar'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-chinup',
    name: 'Chin-Up',
    description: 'Underhand grip pull-up, more biceps emphasis.',
    equipment_tags: ['bodyweight', 'bar'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-inverted-row',
    name: 'Inverted Row',
    description: 'Horizontal row under a bar or rings, targets mid-back.',
    equipment_tags: ['bodyweight', 'bar', 'rings'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-bodyweight-squat',
    name: 'Bodyweight Squat',
    description: 'Standard air squat, targets quads and glutes.',
    equipment_tags: ['bodyweight'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    description: 'Rear foot elevated split squat, heavy quad focus.',
    equipment_tags: ['bodyweight'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-pistol-squat',
    name: 'Pistol Squat',
    description: 'Single-leg squat, advanced leg strength.',
    equipment_tags: ['bodyweight'],
    difficulty: 'advanced',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-dips',
    name: 'Dips',
    description: 'Parallel bar dip, triceps and lower chest.',
    equipment_tags: ['bodyweight', 'bars'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-plank',
    name: 'Plank',
    description: 'Core isometric hold.',
    equipment_tags: ['bodyweight'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-hollow-body-hold',
    name: 'Hollow Body Hold',
    description: 'Lying core compression, foundational for calisthenics.',
    equipment_tags: ['bodyweight'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-arch-hold',
    name: 'Arch Hold',
    description: 'Prone back extension hold, targets spinal erectors and glutes.',
    equipment_tags: ['bodyweight'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-copenhagen-plank',
    name: 'Copenhagen Plank',
    description: 'Side core hold with top leg on bench, targets adductors and obliques.',
    equipment_tags: ['bodyweight', 'bench'],
    difficulty: 'advanced',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-dumbbell-bicep-curl',
    name: 'Dumbbell Bicep Curl',
    description: 'Standing bicep curl with dumbbells.',
    equipment_tags: ['dumbbells'],
    difficulty: 'beginner',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ex-dumbbell-overhead-press',
    name: 'Dumbbell Overhead Press',
    description: 'Seated or standing dumbbell press for shoulders.',
    equipment_tags: ['dumbbells'],
    difficulty: 'intermediate',
    illustration_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ---------------------------------------------------------------------------
// Hardcoded muscle mappings (exercise → muscle group with role)
// ---------------------------------------------------------------------------

export const SEED_MAPPINGS: MuscleMapping[] = [
  // Pike Push-Up → Shoulders (primary), Arms (secondary)
  { exercise_id: 'ex-pike-pushup',             muscle_group_id: 'mg-shoulders', role: 'primary' },
  { exercise_id: 'ex-pike-pushup',             muscle_group_id: 'mg-arms',     role: 'secondary' },
  // Standard Push-Up → Chest (primary), Arms (secondary)
  { exercise_id: 'ex-standard-pushup',         muscle_group_id: 'mg-chest',    role: 'primary' },
  { exercise_id: 'ex-standard-pushup',         muscle_group_id: 'mg-arms',     role: 'secondary' },
  // Ring Push-Up → Chest (primary), Arms (secondary), Core (secondary)
  { exercise_id: 'ex-ring-pushup',             muscle_group_id: 'mg-chest',    role: 'primary' },
  { exercise_id: 'ex-ring-pushup',             muscle_group_id: 'mg-arms',     role: 'secondary' },
  { exercise_id: 'ex-ring-pushup',             muscle_group_id: 'mg-core',     role: 'secondary' },
  // Pull-Up → Back (primary), Arms (secondary)
  { exercise_id: 'ex-pullup',                  muscle_group_id: 'mg-back',     role: 'primary' },
  { exercise_id: 'ex-pullup',                  muscle_group_id: 'mg-arms',     role: 'secondary' },
  // Chin-Up → Back (primary), Arms (secondary)
  { exercise_id: 'ex-chinup',                  muscle_group_id: 'mg-back',     role: 'primary' },
  { exercise_id: 'ex-chinup',                  muscle_group_id: 'mg-arms',     role: 'secondary' },
  // Inverted Row → Back (primary), Arms (secondary)
  { exercise_id: 'ex-inverted-row',            muscle_group_id: 'mg-back',     role: 'primary' },
  { exercise_id: 'ex-inverted-row',            muscle_group_id: 'mg-arms',     role: 'secondary' },
  // Bodyweight Squat → Legs (primary)
  { exercise_id: 'ex-bodyweight-squat',        muscle_group_id: 'mg-legs',     role: 'primary' },
  // Bulgarian Split Squat → Legs (primary), Core (secondary)
  { exercise_id: 'ex-bulgarian-split-squat',   muscle_group_id: 'mg-legs',     role: 'primary' },
  { exercise_id: 'ex-bulgarian-split-squat',   muscle_group_id: 'mg-core',     role: 'secondary' },
  // Pistol Squat → Legs (primary), Core (secondary)
  { exercise_id: 'ex-pistol-squat',            muscle_group_id: 'mg-legs',     role: 'primary' },
  { exercise_id: 'ex-pistol-squat',            muscle_group_id: 'mg-core',     role: 'secondary' },
  // Dips → Arms (primary), Chest (secondary), Shoulders (secondary)
  { exercise_id: 'ex-dips',                    muscle_group_id: 'mg-arms',     role: 'primary' },
  { exercise_id: 'ex-dips',                    muscle_group_id: 'mg-chest',    role: 'secondary' },
  { exercise_id: 'ex-dips',                    muscle_group_id: 'mg-shoulders', role: 'secondary' },
  // Plank → Core (primary)
  { exercise_id: 'ex-plank',                   muscle_group_id: 'mg-core',     role: 'primary' },
  // Hollow Body Hold → Core (primary)
  { exercise_id: 'ex-hollow-body-hold',        muscle_group_id: 'mg-core',     role: 'primary' },
  // Arch Hold → Back (primary), Legs (secondary)
  { exercise_id: 'ex-arch-hold',               muscle_group_id: 'mg-back',     role: 'primary' },
  { exercise_id: 'ex-arch-hold',               muscle_group_id: 'mg-legs',     role: 'secondary' },
  // Copenhagen Plank → Core (primary), Legs (secondary)
  { exercise_id: 'ex-copenhagen-plank',        muscle_group_id: 'mg-core',     role: 'primary' },
  { exercise_id: 'ex-copenhagen-plank',        muscle_group_id: 'mg-legs',     role: 'secondary' },
  // Dumbbell Bicep Curl → Arms (primary)
  { exercise_id: 'ex-dumbbell-bicep-curl',     muscle_group_id: 'mg-arms',     role: 'primary' },
  // Dumbbell Overhead Press → Shoulders (primary), Arms (secondary)
  { exercise_id: 'ex-dumbbell-overhead-press', muscle_group_id: 'mg-shoulders', role: 'primary' },
  { exercise_id: 'ex-dumbbell-overhead-press', muscle_group_id: 'mg-arms',     role: 'secondary' },
];
