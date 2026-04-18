import "server-only";

import type { AuthClientUser } from "@/lib/auth-client";
import { getPendingEmailChangeState } from "@/server/account/email-change";
import { getAuthSession } from "@/server/auth/session";

export type AccountOverview = {
  pendingEmail: string | null;
  user: AuthClientUser;
};

export async function getAccountOverview(
  headers: Headers,
): Promise<AccountOverview | null> {
  const session = await getAuthSession({ headers });

  if (!session?.user) {
    return null;
  }

  const pendingEmailState = await getPendingEmailChangeState({ headers });

  if (pendingEmailState.kind === "unauthorized") {
    return null;
  }

  return {
    pendingEmail: pendingEmailState.value.pendingEmail,
    user: session.user,
  };
}
