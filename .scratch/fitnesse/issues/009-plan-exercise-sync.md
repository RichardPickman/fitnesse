# 009 — Exercise Library Sync (Offline Cache)

**Blockers:** 002, 003

## Objective
Implement the caching mechanism so exercise library data and images are available offline for the workout player.

## Acceptance
- [ ] On app launch (or plan editor open): fetch exercises from Supabase → store in `cached_exercises` table
- [ ] On app launch (or plan editor open): fetch muscle mappings → store in `cached_muscle_mappings`
- [ ] On plan save: download all illustrations referenced by exercises in the plan to local filesystem
  - Use expo-file-system to download to `FileSystem.documentDirectory + 'exercise-images/'`
  - Store local file paths in a temporary mapping
  - Update `plan_exercise_entries` metadata with local image path (or separate cache table)
- [ ] If download fails: use placeholder image (a simple icon/grey placeholder)
- [ ] Version check: store `cached_at` timestamp, re-fetch if > 24h old (or force refresh button)
- [ ] Graceful degradation: if offline, use cached data silently (no error toasts)

## Notes
- Keep it simple — don't over-engineer the sync. V1 only needs: "fetch everything when you open the editor, save locally, and images are pre-downloaded"
- Use a simple Zustand store for "isSyncing" state if needed for UI feedback
