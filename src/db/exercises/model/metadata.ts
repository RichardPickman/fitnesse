import { getDb } from "@/db/local";

// ---------------------------------------------------------------------------
// App metadata helpers
// ---------------------------------------------------------------------------

export async function getLastSyncedAt(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>(
    "SELECT value FROM app_metadata WHERE key = 'last_synced_at'",
  );

  return row?.value ?? null;
}

export async function setLastSyncedAt(timestamp: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_synced_at', ?)",
    timestamp,
  );
}