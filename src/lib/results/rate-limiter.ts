/**
 * In-memory rate limiter with automatic eviction.
 *
 * NOTE: This is still in-memory and resets on deploy / does NOT work
 * across multiple instances.  For production, swap the storage backend
 * with Redis/Upstash (or another distributed store) while keeping the
 * same public API.
 */

interface BucketEntry {
  timestamps: number[];
  lastAccess: number;
}

const DEFAULT_WINDOW_MS = 60_000;   // 1 minute
const DEFAULT_MAX_REQUESTS = 10;    // per window
const EVICTION_INTERVAL_MS = 300_000; // clean stale entries every 5 min

class RateLimiter {
  private buckets = new Map<string, BucketEntry>();
  private windowMs: number;
  private maxRequests: number;
  private evictionTimer: ReturnType<typeof setInterval> | null = null;

  constructor(windowMs = DEFAULT_WINDOW_MS, maxRequests = DEFAULT_MAX_REQUESTS) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Periodic eviction so stale IPs don't leak memory
    this.evictionTimer = setInterval(() => this.evict(), EVICTION_INTERVAL_MS);
    // Allow Node to exit even if the timer is still alive
    if (this.evictionTimer && typeof this.evictionTimer === 'object' && 'unref' in this.evictionTimer) {
      this.evictionTimer.unref();
    }
  }

  /**
   * Returns `true` if the request is allowed, `false` if rate‑limited.
   */
  check(key: string): boolean {
    const now = Date.now();
    const entry = this.buckets.get(key);

    if (!entry) {
      this.buckets.set(key, { timestamps: [now], lastAccess: now });
      return true;
    }

    // Keep only timestamps inside the window
    entry.timestamps = entry.timestamps.filter((t) => now - t < this.windowMs);
    entry.lastAccess = now;

    if (entry.timestamps.length >= this.maxRequests) {
      return false;
    }

    entry.timestamps.push(now);
    return true;
  }

  /** Remove entries that haven't been accessed in 2× the window. */
  private evict() {
    const cutoff = Date.now() - this.windowMs * 2;
    for (const [key, entry] of this.buckets) {
      if (entry.lastAccess < cutoff) {
        this.buckets.delete(key);
      }
    }
  }

  /** Exposed for testing. */
  reset() {
    this.buckets.clear();
  }

  destroy() {
    if (this.evictionTimer) clearInterval(this.evictionTimer);
    this.buckets.clear();
  }
}

// Module‑level singleton
export const rateLimiter = new RateLimiter();
