import type { AuthClientSession } from "@/lib/auth-client";
import { getServerSession } from "@/lib/server-api";

export async function getAuthSession({
  headers,
}: {
  headers: Headers;
}): Promise<AuthClientSession | null> {
  return getServerSession(headers);
}
