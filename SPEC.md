# Fitnesse — Spec

A mobile-first fitness tracking app for calisthenics and weight-based training. Local-first, with an admin-curated exercise library on Supabase.

---

## Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Mobile | Expo (React Native) + TypeScript | Cross-platform, hot-reload, EAS builds |
| State | Zustand | Lightweight, no boilerplate |
| Local DB | expo-sqlite | Workout history, plans, photos, settings |
| Backend | Supabase | Exercise library only (public read), future auth + marketplace |
| Images | expo-file-system (local), Supabase Storage (future) | |

---

## Core Data Model

### Server-side (Supabase)

```sql
-- Exercise library (admin-curated)
CREATE TABLE exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  equipment_tags  TEXT[] NOT NULL DEFAULT '{}',  -- bodyweight, dumbbells, barbell, bands, gym...
  difficulty      TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  illustration_url TEXT,      -- SVG or image URL for workout player
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Hierarchical muscle groups
CREATE TABLE muscle_groups (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id    UUID REFERENCES muscle_groups(id),
  name         TEXT NOT NULL,
  svg_zone_key TEXT,
  sort_order   INT DEFAULT 0
);

-- Exercise ↔ Muscle mapping (primary/secondary)
CREATE TABLE exercise_muscle_mapping (
  exercise_id      UUID REFERENCES exercises(id) ON DELETE CASCADE,
  muscle_group_id  UUID REFERENCES muscle_groups(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('primary','secondary')),
  PRIMARY KEY (exercise_id, muscle_group_id, role)
);
```

### Local (SQLite)

```sql
-- Saved plans (user-created)
CREATE TABLE plans (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  equipment_tags  TEXT DEFAULT '[]',        -- JSON array of equipment
  version_hash    TEXT NOT NULL,             -- hash of plan content for history linking
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

-- Day templates within a plan
CREATE TABLE plan_days (
  id              TEXT PRIMARY KEY,
  plan_id         TEXT NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  day_of_week     INTEGER NOT NULL,          -- 0=Mon, 1=Tue, ..., 6=Sun
  sort_order      INTEGER DEFAULT 0
);

-- Exercise entries within a day
CREATE TABLE plan_exercise_entries (
  id              TEXT PRIMARY KEY,
  plan_day_id     TEXT NOT NULL REFERENCES plan_days(id) ON DELETE CASCADE,
  exercise_id     TEXT NOT NULL,              -- UUID referencing Supabase exercises
  target_sets     INTEGER NOT NULL DEFAULT 3,
  target_reps     INTEGER NOT NULL DEFAULT 10,
  rest_seconds    INTEGER NOT NULL DEFAULT 90,
  weight_kg       REAL,
  superset_group  TEXT,                       -- same group id = superset partners
  sort_order      INTEGER DEFAULT 0
);

-- Workout sessions (one per workout start)
CREATE TABLE workout_sessions (
  id              TEXT PRIMARY KEY,
  plan_id         TEXT REFERENCES plans(id),
  plan_day_id     TEXT,
  plan_version_hash TEXT,                     -- frozen version at time of workout
  started_at      TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at    TEXT,
  duration_seconds INTEGER,
  notes           TEXT,
  rating          INTEGER                     -- 1-5
);

-- Individual set logs
CREATE TABLE set_logs (
  id              TEXT PRIMARY KEY,
  session_id      TEXT NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id     TEXT NOT NULL,
  set_number      INTEGER NOT NULL,
  reps_actual     INTEGER NOT NULL,
  weight_kg       REAL,
  completed_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Progress photos (local filesystem)
CREATE TABLE progress_photos (
  id              TEXT PRIMARY KEY,
  session_id      TEXT REFERENCES workout_sessions(id) ON DELETE SET NULL,
  file_path       TEXT NOT NULL,               -- local filesystem path
  taken_at        TEXT NOT NULL DEFAULT (datetime('now')),
  body_region     TEXT                         -- 'full_body','upper','lower',etc.
);

-- Cached exercise library (offline support)
CREATE TABLE cached_exercises (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  description     TEXT,
  equipment_tags  TEXT DEFAULT '[]',
  difficulty      TEXT,
  illustration_url TEXT,
  cached_at       TEXT DEFAULT (datetime('now'))
);

CREATE TABLE cached_muscle_mappings (
  exercise_id     TEXT NOT NULL,
  muscle_group_id TEXT NOT NULL,
  role            TEXT NOT NULL,
  PRIMARY KEY (exercise_id, muscle_group_id, role)
);
```

---

## Navigation

Bottom tab bar with 3 tabs:

1. **🏠 Home** — Today's workout card, quick stats from last session, rest day prompt
2. **💪 Plans** — List of user's plans, tap to view/edit, "Create New Plan" button
3. **📊 History** — Chronological session list, tap for detail. Separate "Progress Photos" screen accessible from here

Workout player is a full-screen stack pushed over the tab bar (not a tab).

---

## Screen Details

### Home Tab
- Greeting + date at top
- Main card: "Today's workout" from active plan (or "Rest" + suggestion to create/update plan)
- Quick stats from last session (volume, duration, exercises)
- "Start Workout" button (or "Resume" if paused session exists)

### Plans Tab
- Card list of plans (name, equipment tags, days, last used)
- Tap → Plan Detail screen (exercises per day, body map summary, edit/duplicate/delete)
- FAB: "Create New Plan"

### Plan Editor (push navigation from Plans or Home)
- **Name & Equipment** — text input + multi-select chips
- **Day configuration** — toggle days of week, tap to edit each day
- **Per-day editor:**
  - Body map at top (front + back SVG, real-time highlighting)
  - Exercise list (reorder, set reps/sets/rest/weight, superset pairing)
  - "Add exercise" opens bottom sheet (search + filter by muscle group, with illustration thumbnails)
- **Review & Save** — summary, full body map, save button

### Workout Player (full-screen, covers tabs)
- Exercise name + illustration
- Set counter (2/3), target reps (tappable for quick adjust)
- Weight display (if applicable)
- "Complete Set" button
- "Skip rest" and "Skip set" small text buttons
- After last set → "Next Exercise" button
- Rest timer (manual start, countdown, beep on end, skippable)
- Overall progress bar at bottom

### End of Workout
- Brief celebration (confetti/animation, skippable)
- Summary: duration, exercises done, sets, volume
- Notes input: "How did it feel?"
- Photo prompt: "Take a progress photo?" (Yes/Skip)
- "Done" → back to Home

### History Tab
- Chronological list of sessions (date, plan name, duration)
- Tap → session detail: exercise list with set logs, notes, photos
- Separate "Progress Photos" grid screen (grouped by month, compare mode)

---

## Key UX Decisions

| Decision | Chosen |
|----------|--------|
| Rest timer start | Manual (user taps to start) |
| Rest timer skip | Yes (small button) |
| Rep logging | Default = target, tappable to adjust per set |
| Plan modification | New version hash, old logs reference old hash |
| Photo storage | Local filesystem only (expo-file-system) |
| Photo prompt | After every workout (skippable) |
| Offline | Workout player works fully offline. Plan data cached on save |
| Exercise images | Downloaded when plan is saved |
| Streaks | No — "consistency rate" (% of planned days completed) |
| Theme | Dark + Light, system-follow default |
| Body map visibility | At top of plan editor, real-time updates |
| Exercise picker | Bottom sheet with search + muscle group filter |
| Supersets | Paired exercises, no rest between, rest after pair complete |
| Backlog | Shuffle exercises, plan marketplace, custom sounds, paywalled photo cloud |
| Store init | Replace `useEffect` in screens with root-level store hydration (no re-render on mount) |

---

## Future Considerations

- **Auth + Sharing**: add Supabase Auth when marketplace is ready. Plans can be shared via public lookup.
- **Marketplace**: separate Supabase table for shared plans, with rating/download tracking.
- **Photos to cloud**: optional paid tier per user. Not your cost.
- **Custom sounds**: pluggable architecture from day one — just a file picker + store path.
