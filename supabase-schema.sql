-- ============================================================
-- Fitnesse — Supabase Schema
-- Run this in Supabase SQL Editor. Safe to run multiple times.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Tables (CREATE IF NOT EXISTS for idempotency)
-- -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS muscle_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID,
  name         TEXT NOT NULL,
  svg_zone_key TEXT,
  sort_order   INT DEFAULT 0
);

-- Safe-add FK (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_muscle_groups_parent'
  ) THEN
    ALTER TABLE muscle_groups
      ADD CONSTRAINT fk_muscle_groups_parent
      FOREIGN KEY (parent_id) REFERENCES muscle_groups(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS exercises (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  equipment_tags   TEXT[] NOT NULL DEFAULT '{}',
  difficulty       TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  illustration_url TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exercise_muscle_mapping (
  exercise_id      UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id  UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('primary', 'secondary')),
  updated_at       TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (exercise_id, muscle_group_id, role)
);

-- -----------------------------------------------------------
-- 1b. Migration: add updated_at to existing exercise_muscle_mapping
-- -----------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'exercise_muscle_mapping' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE exercise_muscle_mapping ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Backfill any existing rows that have NULL updated_at
UPDATE exercise_muscle_mapping SET updated_at = now() WHERE updated_at IS NULL;

-- -----------------------------------------------------------
-- 1c. Triggers: auto-bump updated_at on mapping changes
-- -----------------------------------------------------------

-- Bump the mapping's own updated_at on any change
CREATE OR REPLACE FUNCTION bump_mapping_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_mapping_updated_at ON exercise_muscle_mapping;
CREATE TRIGGER trg_mapping_updated_at
  BEFORE UPDATE ON exercise_muscle_mapping
  FOR EACH ROW EXECUTE FUNCTION bump_mapping_updated_at();

-- Bump the parent exercise's updated_at when its mappings change,
-- so delta sync picks up the exercise on next sync.
CREATE OR REPLACE FUNCTION bump_exercise_on_mapping_change()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE exercises SET updated_at = now()
  WHERE id = COALESCE(NEW.exercise_id, OLD.exercise_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_exercise_bump_on_mapping ON exercise_muscle_mapping;
CREATE TRIGGER trg_exercise_bump_on_mapping
  AFTER INSERT OR UPDATE OR DELETE ON exercise_muscle_mapping
  FOR EACH ROW EXECUTE FUNCTION bump_exercise_on_mapping_change();

-- -----------------------------------------------------------
-- 2. RLS: Public read-only (no auth needed)
-- -----------------------------------------------------------

ALTER TABLE muscle_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_muscle_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to make this re-runnable
DROP POLICY IF EXISTS "Anyone can read muscle_groups" ON muscle_groups;
DROP POLICY IF EXISTS "Anyone can read exercises" ON exercises;
DROP POLICY IF EXISTS "Anyone can read exercise_muscle_mapping" ON exercise_muscle_mapping;

CREATE POLICY "Anyone can read muscle_groups"
  ON muscle_groups FOR SELECT USING (true);

CREATE POLICY "Anyone can read exercises"
  ON exercises FOR SELECT USING (true);

CREATE POLICY "Anyone can read exercise_muscle_mapping"
  ON exercise_muscle_mapping FOR SELECT USING (true);

-- -----------------------------------------------------------
-- 3. Seed data: Muscle groups (safe upsert via name unique)
-- -----------------------------------------------------------

-- Add a temporary unique index on name to support ON CONFLICT
CREATE UNIQUE INDEX IF NOT EXISTS idx_muscle_groups_name ON muscle_groups(name);

INSERT INTO muscle_groups (name, svg_zone_key, sort_order) VALUES
  ('Chest',      'chest',      1),
  ('Shoulders',  'shoulders',  2),
  ('Back',       'back',       3),
  ('Arms',       'arms',       4),
  ('Core',       'core',       5),
  ('Legs',       'legs',       6)
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------
-- 4. Seed data: Exercises (safe upsert via name unique)
-- -----------------------------------------------------------

CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);

INSERT INTO exercises (name, description, equipment_tags, difficulty) VALUES
  ('Pike Push-Up',         'Push-up with hips raised high, targeting shoulders. Progress toward HSPU.',                                                                  '{bodyweight}',         'intermediate'),
  ('Standard Push-Up',     'Classic push-up, chest and triceps.',                                                                                                        '{bodyweight}',         'beginner'),
  ('Ring Push-Up',         'Push-ups on gymnastic rings, increased instability for deeper chest activation.',                                                            '{bodyweight,rings}',   'advanced'),
  ('Pull-Up',              'Overhand grip pull-up targeting lats and biceps.',                                                                                           '{bodyweight,bar}',     'intermediate'),
  ('Chin-Up',              'Underhand grip pull-up, more biceps emphasis.',                                                                                              '{bodyweight,bar}',     'intermediate'),
  ('Inverted Row',         'Horizontal row under a bar or rings, targets mid-back.',                                                                                     '{bodyweight,bar,rings}','beginner'),
  ('Bodyweight Squat',     'Standard air squat, targets quads and glutes.',                                                                                              '{bodyweight}',         'beginner'),
  ('Bulgarian Split Squat','Rear foot elevated split squat, heavy quad focus.',                                                                                          '{bodyweight}',         'intermediate'),
  ('Pistol Squat',         'Single-leg squat, advanced leg strength.',                                                                                                   '{bodyweight}',         'advanced'),
  ('Dips',                 'Parallel bar dip, triceps and lower chest.',                                                                                                 '{bodyweight,bars}',    'intermediate'),
  ('Plank',                'Core isometric hold.',                                                                                                                       '{bodyweight}',         'beginner'),
  ('Hollow Body Hold',     'Lying core compression, foundational for calisthenics.',                                                                                     '{bodyweight}',         'beginner'),
  ('Arch Hold',            'Prone back extension hold, targets spinal erectors and glutes.',                                                                             '{bodyweight}',         'beginner'),
  ('Copenhagen Plank',     'Side core hold with top leg on bench, targets adductors and obliques.',                                                                      '{bodyweight,bench}',   'advanced'),
  ('Dumbbell Bicep Curl',  'Standing bicep curl with dumbbells.',                                                                                                        '{dumbbells}',          'beginner'),
  ('Dumbbell Overhead Press','Seated or standing dumbbell press for shoulders.',                                                                                         '{dumbbells}',          'intermediate')
ON CONFLICT (name) DO NOTHING;

-- -----------------------------------------------------------
-- 5. Seed data: Exercise ↔ Muscle mapping (clear + reinsert)
-- -----------------------------------------------------------

-- Wipe mappings so this is safe to re-run
DELETE FROM exercise_muscle_mapping;

DO $$
DECLARE
  chest_id     UUID := (SELECT id FROM muscle_groups WHERE name = 'Chest');
  shoulders_id UUID := (SELECT id FROM muscle_groups WHERE name = 'Shoulders');
  back_id      UUID := (SELECT id FROM muscle_groups WHERE name = 'Back');
  arms_id      UUID := (SELECT id FROM muscle_groups WHERE name = 'Arms');
  core_id      UUID := (SELECT id FROM muscle_groups WHERE name = 'Core');
  legs_id      UUID := (SELECT id FROM muscle_groups WHERE name = 'Legs');
BEGIN
  -- Pike Push-Up → Shoulders (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, shoulders_id, 'primary' FROM exercises WHERE name = 'Pike Push-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Pike Push-Up';

  -- Standard Push-Up → Chest (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, chest_id, 'primary' FROM exercises WHERE name = 'Standard Push-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Standard Push-Up';

  -- Ring Push-Up → Chest (primary), Arms (secondary), Core (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, chest_id, 'primary' FROM exercises WHERE name = 'Ring Push-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Ring Push-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'secondary' FROM exercises WHERE name = 'Ring Push-Up';

  -- Pull-Up → Back (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, back_id, 'primary' FROM exercises WHERE name = 'Pull-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Pull-Up';

  -- Chin-Up → Back (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, back_id, 'primary' FROM exercises WHERE name = 'Chin-Up';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Chin-Up';

  -- Inverted Row → Back (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, back_id, 'primary' FROM exercises WHERE name = 'Inverted Row';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Inverted Row';

  -- Bodyweight Squat → Legs (primary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, legs_id, 'primary' FROM exercises WHERE name = 'Bodyweight Squat';

  -- Bulgarian Split Squat → Legs (primary), Core (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, legs_id, 'primary' FROM exercises WHERE name = 'Bulgarian Split Squat';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'secondary' FROM exercises WHERE name = 'Bulgarian Split Squat';

  -- Pistol Squat → Legs (primary), Core (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, legs_id, 'primary' FROM exercises WHERE name = 'Pistol Squat';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'secondary' FROM exercises WHERE name = 'Pistol Squat';

  -- Dips → Arms (primary), Chest (secondary), Shoulders (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'primary' FROM exercises WHERE name = 'Dips';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, chest_id, 'secondary' FROM exercises WHERE name = 'Dips';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, shoulders_id, 'secondary' FROM exercises WHERE name = 'Dips';

  -- Plank → Core (primary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'primary' FROM exercises WHERE name = 'Plank';

  -- Hollow Body Hold → Core (primary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'primary' FROM exercises WHERE name = 'Hollow Body Hold';

  -- Arch Hold → Back (primary), Legs (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, back_id, 'primary' FROM exercises WHERE name = 'Arch Hold';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, legs_id, 'secondary' FROM exercises WHERE name = 'Arch Hold';

  -- Copenhagen Plank → Core (primary), Legs (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, core_id, 'primary' FROM exercises WHERE name = 'Copenhagen Plank';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, legs_id, 'secondary' FROM exercises WHERE name = 'Copenhagen Plank';

  -- Dumbbell Bicep Curl → Arms (primary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'primary' FROM exercises WHERE name = 'Dumbbell Bicep Curl';

  -- Dumbbell Overhead Press → Shoulders (primary), Arms (secondary)
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, shoulders_id, 'primary' FROM exercises WHERE name = 'Dumbbell Overhead Press';
  INSERT INTO exercise_muscle_mapping (exercise_id, muscle_group_id, role)
  SELECT id, arms_id, 'secondary' FROM exercises WHERE name = 'Dumbbell Overhead Press';
END $$;
