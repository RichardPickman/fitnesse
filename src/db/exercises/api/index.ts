// ---------------------------------------------------------------------------
// Chunked fetch helpers
// ---------------------------------------------------------------------------

import { supabase } from "@/supabase/client";
import { Semaphore, withRetry } from "../helpers";
import { Exercise, MuscleMapping } from "../types";

const MAX_CONCURRENCY = 4;

export async function fetchExerciseChunk(
  since: string,
  offset: number,
  limit: number,
): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .gte('updated_at', since)
    .order('updated_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }

  return (data ?? []) as Exercise[];
}

export async function fetchMappingChunk(
  since: string,
  offset: number,
  limit: number,
): Promise<MuscleMapping[]> {
  const { data, error } = await supabase
    .from('exercise_muscle_mapping')
    .select('*')
    .gte('updated_at', since)
    .order('updated_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch mappings: ${error.message}`);
  }

  return (data ?? []) as MuscleMapping[];
}

// ---------------------------------------------------------------------------
// Generic chunked parallel fetcher
// ---------------------------------------------------------------------------

export async function fetchAllChunks<T>(
  total: number,
  chunkSize: number,
  fetcher: (offset: number, limit: number) => Promise<T[]>,
  onChunkDone: (items: T[]) => void,
): Promise<T[]> {
  const semaphore = new Semaphore(MAX_CONCURRENCY);
  if (total === 0) {
    return [];
  }

  const chunkCount = Math.ceil(total / chunkSize);
  const chunkPromises: Array<Promise<T[]>> = [];

  for (let i = 0; i < chunkCount; i++) {
    const offset = i * chunkSize;
    const limit = Math.min(chunkSize, total - offset);

    const promise = (async () => {
      await semaphore.acquire();

      try {
        const items = await withRetry(
          `chunk ${offset}-${offset + limit - 1}`,
          () => fetcher(offset, limit),
        );

        onChunkDone(items);

        return items;
      } finally {
        semaphore.release();
      }
    })();

    chunkPromises.push(promise);
  }

  const results = await Promise.all(chunkPromises);

  return results.flat();
}