# 002 — Supabase Exercise Library Setup

**Blockers:** 001

## Objective
Create the Supabase project, set up the exercise library schema, and seed initial data. Configure public read-only access (no auth).

## Acceptance
- [ ] Supabase project created (free tier)
- [ ] Tables created: `exercises`, `muscle_groups`, `exercise_muscle_mapping`
- [ ] RLS enabled with public read-only policy on all three tables
- [ ] Supabase client initialized in the Expo app (`src/supabase/client.ts`)
- [ ] `.env` populated with real Supabase URL and anon key
- [ ] API test: fetch all exercises returns rows from the app
- [ ] Seed data: at least 10 exercises covering major muscle groups
- [ ] Seed data: bodyweight + some equipment-based exercises
- [ ] Seed data: muscle group hierarchy (Chest, Shoulders, Back, Arms, Core, Legs — flat in v1)

## Notes
- Admin adds exercises via Supabase Studio dashboard
- No admin UI needed in v1
- Store illustration URLs as empty strings for now — images added later
