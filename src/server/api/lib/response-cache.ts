import "server-only";

import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

const API_CACHE_KEY_PREFIX = "api-cache";
const DEFAULT_API_CACHE_FAILSAFE_BYPASS_SECONDS = 300;

const namespaceCacheBypassUntil = new Map<string, number>();

type ApiCacheEnvelope<T> = {
  value: T;
};

type GetOrSetApiCacheInput<T> = {
  key: unknown;
  loader: () => Promise<T>;
  namespace: string;
  ttlSeconds: number;
};

const redis =
  env.UPSTASH_REDIS_CACHE_ENABLED &&
  env.UPSTASH_REDIS_REST_TOKEN &&
  env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        token: env.UPSTASH_REDIS_REST_TOKEN,
        url: env.UPSTASH_REDIS_REST_URL,
      })
    : null;

export const API_CACHE_NAMESPACES = {
  publicPhotographerDetails: "public-photographer-details",
  publicPhotographerDirectory: "public-photographer-directory",
  specialities: "specialities",
} as const;

export function getBookmarkApiCacheNamespace(userId: string) {
  return `bookmark:${userId}`;
}

function buildApiCacheVersionKey(namespace: string) {
  return `${API_CACHE_KEY_PREFIX}:version:${namespace}`;
}

function getNamespaceCacheBypassUntil(namespace: string) {
  const bypassUntil = namespaceCacheBypassUntil.get(namespace);

  if (!bypassUntil) {
    return null;
  }

  if (bypassUntil <= Date.now()) {
    namespaceCacheBypassUntil.delete(namespace);
    return null;
  }

  return bypassUntil;
}

function isApiCacheNamespaceBypassed(namespace: string) {
  return getNamespaceCacheBypassUntil(namespace) !== null;
}

function bypassApiCacheNamespace(namespace: string, bypassSeconds: number) {
  const nextBypassUntil = Date.now() + bypassSeconds * 1000;
  const currentBypassUntil = getNamespaceCacheBypassUntil(namespace) ?? 0;

  namespaceCacheBypassUntil.set(
    namespace,
    Math.max(currentBypassUntil, nextBypassUntil),
  );
}

function buildApiCacheDataKey(
  namespace: string,
  version: number,
  key: unknown,
) {
  const digest = createHash("sha256").update(JSON.stringify(key)).digest("hex");

  return `${API_CACHE_KEY_PREFIX}:data:${namespace}:v${version}:${digest}`;
}

function parseApiCacheVersion(value: unknown) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsedValue = Number.parseInt(value, 10);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
  }

  return 0;
}

function parseApiCacheEnvelope<T>(value: unknown): ApiCacheEnvelope<T> | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value) as ApiCacheEnvelope<T>;
    } catch {
      return null;
    }
  }

  if (typeof value === "object" && "value" in value) {
    return value as ApiCacheEnvelope<T>;
  }

  return null;
}

function logApiCacheError(
  action: "get" | "set" | "invalidate",
  namespace: string,
  error: unknown,
) {
  console.error("Upstash API cache operation failed", {
    action,
    error,
    namespace,
  });
}

async function getApiCacheNamespaceVersion(namespace: string) {
  if (!redis) {
    return 0;
  }

  const version = await redis.get(buildApiCacheVersionKey(namespace));
  return parseApiCacheVersion(version);
}

export async function getOrSetApiCache<T>({
  key,
  loader,
  namespace,
  ttlSeconds,
}: GetOrSetApiCacheInput<T>): Promise<T> {
  if (!redis || isApiCacheNamespaceBypassed(namespace)) {
    return loader();
  }

  let cacheKey = "";

  try {
    const version = await getApiCacheNamespaceVersion(namespace);
    cacheKey = buildApiCacheDataKey(namespace, version, key);
    const cachedValue = await redis.get(cacheKey);
    const envelope = parseApiCacheEnvelope<T>(cachedValue);

    if (envelope) {
      return envelope.value;
    }
  } catch (error) {
    logApiCacheError("get", namespace, error);
    return loader();
  }

  const freshValue = await loader();

  try {
    await redis.set(
      cacheKey,
      JSON.stringify({
        value: freshValue,
      } satisfies ApiCacheEnvelope<T>),
      {
        ex: ttlSeconds,
      },
    );
  } catch (error) {
    logApiCacheError("set", namespace, error);
  }

  return freshValue;
}

export async function invalidateApiCacheNamespaces(
  namespaces: string[],
  options?: {
    bypassSeconds?: number;
  },
) {
  if (namespaces.length === 0) {
    return;
  }

  const uniqueNamespaces = Array.from(new Set(namespaces));
  const bypassSeconds =
    options?.bypassSeconds ?? DEFAULT_API_CACHE_FAILSAFE_BYPASS_SECONDS;

  if (!redis) {
    uniqueNamespaces.forEach((namespace) => {
      bypassApiCacheNamespace(namespace, bypassSeconds);
    });
    return;
  }

  await Promise.all(
    uniqueNamespaces.map(async (namespace) => {
      try {
        await redis.incr(buildApiCacheVersionKey(namespace));
      } catch (error) {
        bypassApiCacheNamespace(namespace, bypassSeconds);
        logApiCacheError("invalidate", namespace, error);
      }
    }),
  );
}
