# 003 — Local SQLite Database Setup

**Blockers:** 001

## Objective
Set up expo-sqlite, create all local tables, and write a thin DB layer.

## Acceptance
- [ ] `expo-sqlite` installed and initialized
- [ ] Schema creation script (`src/db/schema.ts`) runs on app startup (create tables if not exist)
- [ ] All local tables created: `plans`, `plan_days`, `plan_exercise_entries`, `workout_sessions`, `set_logs`, `progress_photos`, `cached_exercises`, `cached_muscle_mappings`
- [ ] Helper functions for common operations exist:
  - `db.getAllPlans()` / `db.getPlan(id)`
  - `db.savePlan(plan)` (cascading insert into plans + days + entries)
  - `db.deletePlan(id)`
  - `db.createSession(planDayId)` / `db.completeSession(sessionId)`
  - `db.logSet(sessionId, ...)`
  - `db.getSessionHistory(limit, offset)`
  - `db.cacheExercises(exercises[])` / `db.getCachedExercises()`
- [ ] Migration system: `db/migrations/001_initial.sql` with version tracking

## Notes
- All local DB functions are synchronous-friendly or async (expo-sqlite supports both)
- Keep it simple — no ORM, raw SQL via helper functions
- Version track the schema so future migrations are clean
