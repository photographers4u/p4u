import { notFound } from "next/navigation";
import type { AuthClientSession, AuthClientUser } from "@/lib/auth-client";
import { env } from "@/lib/env";

type AccountApiResponse = {
  pendingEmail: string | null;
  user: AuthClientUser;
};

function getRequestOrigin(requestHeaders: Headers) {
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    return env.NEXT_PUBLIC_BASE_URL;
  }

  return `${protocol}://${host}`;
}

function getForwardHeaders(requestHeaders: Headers) {
  const headers = new Headers();
  const cookie = requestHeaders.get("cookie");

  if (cookie) {
    headers.set("cookie", cookie);
  }

  return headers;
}

export function buildServerApiPath(
  path: string,
  query?: Record<string, string | number | boolean | null | undefined>,
) {
  if (!query) {
    return path;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined) {
      continue;
    }

    searchParams.set(key, String(value));
  }

  const search = searchParams.toString();
  return search ? `${path}?${search}` : path;
}

export async function fetchServerAPI(
  requestHeaders: Headers,
  path: string,
  init?: RequestInit,
) {
  return fetch(new URL(path, getRequestOrigin(requestHeaders)), {
    ...init,
    cache: "no-store",
    headers: {
      ...Object.fromEntries(getForwardHeaders(requestHeaders).entries()),
      ...(init?.headers
        ? Object.fromEntries(new Headers(init.headers).entries())
        : {}),
    },
  });
}

export async function getServerSession(requestHeaders: Headers) {
  const response = await fetchServerAPI(
    requestHeaders,
    "/api/auth/get-session?disableCookieCache=true",
  );

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AuthClientSession | null;
  return payload;
}

export async function getServerAdminSession(requestHeaders: Headers) {
  const response = await fetchServerAPI(
    requestHeaders,
    "/api/auth/get-session?disableCookieCache=true",
  );

  if (!response.ok) {
    throw new Error("INTERNAL SERVER ERROR");
  }

  const payload = (await response.json()) as AuthClientSession | null;

  if (!payload || !payload.user) {
    notFound();
  }

  if (payload.user.role !== "admin") {
    notFound();
  }

  return payload;
}

export async function getServerAccount(requestHeaders: Headers) {
  const response = await fetchServerAPI(requestHeaders, "/api/account");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to load account data.");
  }

  return (await response.json()) as AccountApiResponse;
}
