# ADR 006: Exercise Library Sync — Offline-First with Explicit Cloud Sync

## Status

Accepted

## Context

The app needs exercise library data (exercises, muscle groups, mappings) to function. Previously, `fetchExercises()` silently called Supabase on every `loadLibrary()` call, caching results locally and falling back on error. This had several problems:

1. **Silent network requests** — paranoid users could detect outgoing traffic to Supabase with no user-facing trigger, creating trust issues.
2. **No pagination** — fetching all exercises at once is slow on mobile with large datasets.
3. **No delta sync** — every fetch downloaded the entire library, even if nothing changed.
4. **Muscle groups fetched from Supabase** — these are constants that never change, so fetching them remotely is unnecessary.
5. **No user control** — the user had no way to know when or if data was being synced.

## Decision

We adopt an **offline-first** architecture with **explicit user-initiated cloud sync**:

### Seed Bundle

A hardcoded seed bundle (`src/db/seed-exercises.ts`) contains ~20 bodyweight exercises, 6 muscle groups, and their mappings. On first app launch, `seedIfEmpty()` populates the local SQLite database from this bundle. No network call is made.

### Muscle Groups as Constants

Muscle groups are hardcoded in the seed bundle and never fetched from Supabase. The `fetchMuscleGroups()` function now returns the hardcoded array. This eliminates one network call entirely.

### Explicit Sync Screen

A new `/sync` screen is accessible from the Plans tab header ("Sync" button). It shows:
- Current exercise count
- Last synced timestamp (from `app_metadata` table)
- "Sync from Cloud" / "Check for Updates" button

### Paginated Delta Sync

When the user taps sync:
1. If `last_synced_at` exists, fetch only exercises where `updated_at >= last_synced_at` (delta sync).
2. If first sync, paginate through ALL exercises (cursor-based, 50 per page).
3. Cursor is `updated_at` of the last item in each page.
4. After all exercise pages, fetch all mappings (small table, single request).
5. Save `last_synced_at = now()` to `app_metadata`.
6. Reload store from local cache.

### No Silent Requests

`loadLibrary()` now only reads from local SQLite (seeding if empty). It never makes network requests. The only network call is when the user explicitly taps "Sync" on the sync screen.

## Consequences

### Positive

- **Zero silent network requests** — all traffic is user-initiated and visible.
- **Works offline immediately** — seed bundle provides enough exercises to create plans.
- **Efficient delta sync** — subsequent syncs only download changed exercises.
- **Scalable** — cursor-based pagination handles thousands of exercises.
- **Transparent** — user sees exercise count, last sync date, and progress during sync.

### Negative

- **Seed bundle maintenance** — adding new exercises to the seed requires an app update. However, the seed is only a starting point; users can sync to get the full library.
- **Mappings re-fetched entirely** — we wipe and re-insert all mappings on each sync. This is fine for the current dataset size (~100 rows) but may need delta logic if mappings grow significantly.

## Technical Details

### New Tables

```sql
CREATE TABLE IF NOT EXISTS app_metadata (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### Updated Tables

`cached_exercises` now includes an `updated_at` column to support delta sync.

### Key Functions

| Function | Purpose |
|---|---|
| `seedIfEmpty()` | Seed local DB from hardcoded bundle if empty |
| `getCachedExercises()` | Read exercises from local SQLite |
| `getCachedMappings()` | Read mappings from local SQLite |
| `getLastSyncedAt()` | Read `last_synced_at` from `app_metadata` |
| `setLastSyncedAt()` | Write `last_synced_at` to `app_metadata` |
| `syncExercisesFromCloud()` | Paginated delta sync from Supabase with progress |
| `fetchExercisesPage()` | Fetch one page (50 items) with cursor/since |

### Store State

The `exerciseStore` now tracks:
- `isSyncing: boolean`
- `syncProgress: { current: number; total: number | null } | null`
- `lastSyncedAt: string | null`
- `syncFromCloud()` action

## Future Considerations

- **Image download** — when exercise illustrations are added, download only for exercises in a plan, on plan save.
- **Public plans sync** — the same sync infrastructure can be extended to fetch example/public plans from Supabase.
