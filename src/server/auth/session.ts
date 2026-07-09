import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";
import { isAdminPanelRole } from "@/lib/admin-role";
import type { AuthClientSession } from "@/lib/auth-client";
import { auth } from "@/server/auth";

type GetAuthSessionInput = {
  headers: Headers;
};

const freshSessionQuery = {
  disableCookieCache: true,
} as const;

const getCachedAuthSession = cache(async (headers: Headers) => {
  return auth.api.getSession({
    headers,
    query: freshSessionQuery,
  });
});

export async function getAuthSession({
  headers,
}: GetAuthSessionInput): Promise<AuthClientSession | null> {
  return getCachedAuthSession(headers);
}

export async function getAdminAuthSession({ headers }: GetAuthSessionInput) {
  const session = await getAuthSession({ headers });

  if (!session?.user || !isAdminPanelRole(session.user.role)) {
    notFound();
  }

  return session;
}
