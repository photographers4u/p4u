import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

type CacheStore = {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: {
      ttlSeconds?: number;
    },
  ): Promise<void>;
  del(...keys: string[]): Promise<void>;
  incr(key: string): Promise<number>;
};

type CacheEnvelope<T> = {
  cachedAt: string;
  value: T;
};

type CacheOrFetchOptions<T> = {
  ttlSeconds: number;
  cacheNull?: boolean;
  shouldCache?: (value: T) => boolean;
};

const CACHE_PREFIX = "cache:v1";

const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const redisCacheStore: CacheStore | null =
  redis
    ? {
        async get(key) {
          const value = await redis.get<string>(key);
          return value ?? null;
        },
        async set(key, value, options) {
          if (options?.ttlSeconds) {
            await redis.set(key, value, {
              ex: options.ttlSeconds,
            });
            return;
          }

          await redis.set(key, value);
        },
        async del(...keys) {
          if (keys.length === 0) {
            return;
          }

          await redis.del(...keys);
        },
        async incr(key) {
          const value = await redis.incr(key);
          return value ?? 1;
        },
      }
    : null;

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nestedValue]) => [key, stableValue(nestedValue)]),
    );
  }

  return value;
}

function hashKeyParts(parts: readonly unknown[]) {
  return createHash("sha1")
    .update(JSON.stringify(stableValue(parts)))
    .digest("hex");
}

function getCacheNamespaceVersionKey(namespace: string) {
  return `${CACHE_PREFIX}:${namespace}:version`;
}

async function getCacheNamespaceVersion(namespace: string) {
  if (!redisCacheStore) {
    return 1;
  }

  try {
    const raw = await redisCacheStore.get(getCacheNamespaceVersionKey(namespace));
    const parsed = Number(raw);

    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  } catch {
    return 1;
  }
}

export async function buildVersionedCacheKey(
  namespace: string,
  parts: readonly unknown[],
) {
  const version = await getCacheNamespaceVersion(namespace);
  return `${CACHE_PREFIX}:${namespace}:v${version}:${hashKeyParts(parts)}`;
}

export async function invalidateCacheNamespace(namespace: string) {
  if (!redisCacheStore) {
    return;
  }

  try {
    await redisCacheStore.incr(getCacheNamespaceVersionKey(namespace));
  } catch {
    // Cache invalidation should never take down the request path.
  }
}

export async function cacheOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOrFetchOptions<T>,
): Promise<T> {
  if (!redisCacheStore) {
    return fetcher();
  }

  try {
    const cached = await redisCacheStore.get(key);

    if (cached) {
      const parsed = JSON.parse(cached) as CacheEnvelope<T>;
      return parsed.value;
    }
  } catch {
    // Fall through to the source of truth on cache read failures.
  }

  const value = await fetcher();
  const shouldCache =
    options.shouldCache?.(value) ?? (options.cacheNull ? true : value != null);

  if (!shouldCache) {
    return value;
  }

  try {
    const payload: CacheEnvelope<T> = {
      cachedAt: new Date().toISOString(),
      value,
    };

    await redisCacheStore.set(key, JSON.stringify(payload), {
      ttlSeconds: options.ttlSeconds,
    });
  } catch {
    // Ignore cache write failures and return the fresh value.
  }

  return value;
}

