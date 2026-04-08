import {
  adminClient,
  inferAdditionalFields,
  magicLinkClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "@/server/auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    magicLinkClient(),
    adminClient(),
  ],
});

export type AuthClientSession = typeof authClient.$Infer.Session;
export type AuthClientUser = (typeof authClient.$Infer.Session)["user"];
