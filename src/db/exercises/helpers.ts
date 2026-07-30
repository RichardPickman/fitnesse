// ---------------------------------------------------------------------------
// Retry helper
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;

export async function withRetry<T>(
  label: string,
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[sync] ${label} attempt ${attempt}/${retries} failed:`, err);

      if (attempt < retries) {
        // Exponential backoff: 1s, 2s
        await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw lastError;
}

// ---------------------------------------------------------------------------
// Semaphore: limit concurrent async work
// ---------------------------------------------------------------------------

export class Semaphore {
  private queue: Array<() => void> = [];
  private active = 0;

  constructor(private max: number) {}

  async acquire(): Promise<void> {
    if (this.active < this.max) {
      this.active++;

      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  release(): void {
    const next = this.queue.shift();

    if (next) {
      next();
    } else {
      this.active--;
    }
  }
}