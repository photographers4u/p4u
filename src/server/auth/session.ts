import "server-only";

import { notFound } from "next/navigation";
import type { AuthClientSession } from "@/lib/auth-client";
import { auth } from "@/server/auth";

type GetAuthSessionInput = {
  headers: Headers;
};

const freshSessionQuery = {
  disableCookieCache: true,
} as const;

export async function getAuthSession({
  headers,
}: GetAuthSessionInput): Promise<AuthClientSession | null> {
  return auth.api.getSession({
    headers,
    query: freshSessionQuery,
  });
}

export async function getAdminAuthSession({ headers }: GetAuthSessionInput) {
  const session = await getAuthSession({ headers });

  if (!session?.user || session.user.role !== "admin") {
    notFound();
  }

  return session;
}
