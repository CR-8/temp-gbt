import Redis from "ioredis";

declare global {
  var __redis: Redis | undefined;
}

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const client =
    global.__redis ??
    new Redis(url, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // never block the request path on a dead Redis
    });

  if (process.env.NODE_ENV !== "production") global.__redis = client;

  client.on("error", (err) => {
    console.warn("[redis] connection error:", err.message);
  });

  return client;
}

const redis = createClient();

/** Best-effort cache read. Returns null on miss or if Redis is unavailable. */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Best-effort cache write. Silently no-ops if Redis is unavailable. */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // caching is a perf optimization, never fail the request over it
  }
}

/** Raw (non-JSON) cache read/write — used for binary-ish payloads like the Unicorn Studio SDK script. */
export async function cacheGetRaw(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSetRaw(key: string, value: string, ttlSeconds: number): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, value, "EX", ttlSeconds);
  } catch {
    // no-op
  }
}

export async function cacheDel(keyOrPrefix: string): Promise<void> {
  if (!redis) return;
  try {
    if (keyOrPrefix.endsWith("*")) {
      const keys = await redis.keys(keyOrPrefix);
      if (keys.length) await redis.del(...keys);
    } else {
      await redis.del(keyOrPrefix);
    }
  } catch {
    // no-op
  }
}

export default redis;
