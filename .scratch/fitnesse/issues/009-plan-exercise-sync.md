# 009 — Exercise Library Sync (Offline Cache)

**Blockers:** 002, 003

## Objective
Implement the caching mechanism so exercise library data is available offline. No silent network requests — user explicitly triggers sync.

## Acceptance
- [x] Seed bundle with ~20 bodyweight exercises (hardcoded, no network)
- [x] On first launch: seed local SQLite from bundle if empty
- [x] Muscle groups are hardcoded constants (no Supabase fetch)
- [x] Sync screen accessible from Plans tab header
- [x] Sync screen shows: exercise count, last synced date, "Sync from cloud" button
- [x] Paginated fetch from Supabase (cursor-based, 50 per page)
- [x] Delta sync: only fetch exercises where `updated_at > last_synced_at`
- [x] Progress indicator during sync
- [x] No silent background requests to Supabase
- [x] `app_metadata` table for storing `last_synced_at`
- [x] Remove `fetchMuscleGroups()` Supabase call
- [x] Remove `cached_muscle_mappings` table (mappings come from seed or sync)

## Notes
- Images skipped for now (no images exist yet)
- When images are added: download only for exercises in a plan, on plan save
