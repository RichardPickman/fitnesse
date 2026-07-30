import { fetchAllChunks, fetchExerciseChunk, fetchMappingChunk } from './api';
import { countChangedExercises, countChangedMappings } from './api/counters';
import { getLastSyncedAt, setLastSyncedAt } from './model/metadata';
import { upsertExercises, upsertMappings } from './model/upsert';
import { SyncProgress } from './types';



// ---------------------------------------------------------------------------
// Delta sync from Supabase — count-first, chunked, parallel
// ---------------------------------------------------------------------------

const CHUNK_SIZE = 50;

// ---------------------------------------------------------------------------
// Public sync API
// ---------------------------------------------------------------------------

/**
 * Sync exercises and their muscle mappings from Supabase.
 *
 * Strategy:
 *  1. Count how many exercises and mappings changed since `lastSyncedAt`.
 *  2. Split each into chunks of `CHUNK_SIZE` and fetch them in parallel.
 *  3. Retry failed chunks up to `MAX_RETRIES` times with exponential backoff.
 *  4. Upsert everything into the local cache.
 *  5. Save the new `lastSyncedAt` timestamp.
 */
export async function syncExercisesFromCloud(
  onProgress?: (progress: SyncProgress) => void,
): Promise<void> {
  const lastSyncedAt = await getLastSyncedAt();
  const since = lastSyncedAt ?? '1970-01-01T00:00:00.000Z';

  // --- Phase 1: Count ---
  onProgress?.({ current: 0, total: null, phase: 'counting' });

  const [exerciseTotal, mappingTotal] = await Promise.all([
    countChangedExercises(since),
    countChangedMappings(since),
  ]);

  const total = exerciseTotal + mappingTotal;

  if (total === 0) {
    // Nothing changed — still save timestamp so we don't re-check
    const now = new Date().toISOString();
    await setLastSyncedAt(now);
    onProgress?.({ current: 0, total: 0, phase: 'done' });

    return;
  }

  // --- Phase 2: Fetch exercises (chunked, parallel) ---
  onProgress?.({ current: 0, total, phase: 'exercises' });

  let fetchedSoFar = 0;

  const reportProgress = (phase: SyncProgress['phase'], items: unknown[]) => {
    fetchedSoFar += items.length;
    onProgress?.({ current: fetchedSoFar, total, phase });
  };

  const exercises = await fetchAllChunks(
    exerciseTotal,
    CHUNK_SIZE,
    (offset, limit) => fetchExerciseChunk(since, offset, limit),
    (items) => reportProgress('exercises', items),
  );

  // --- Phase 3: Fetch mappings (chunked, parallel) ---
  onProgress?.({ current: fetchedSoFar, total, phase: 'mappings' });

  const mappings = await fetchAllChunks(
    mappingTotal,
    CHUNK_SIZE,
    (offset, limit) => fetchMappingChunk(since, offset, limit),
    (items) => reportProgress('mappings', items),
  );

  // --- Phase 4: Save to local DB ---
  onProgress?.({ current: fetchedSoFar, total, phase: 'saving' });

  await Promise.all([
    upsertExercises(exercises),
    upsertMappings(mappings),
  ]);

  // --- Phase 5: Save sync timestamp ---
  const now = new Date().toISOString();
  await setLastSyncedAt(now);

  onProgress?.({ current: total, total, phase: 'done' });
}

