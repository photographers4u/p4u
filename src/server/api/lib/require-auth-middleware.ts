import type { Session, User } from "better-auth";
import type { Context } from "hono";
import { createMiddleware } from "hono/factory";

export type ApiAuthVariables = {
  user: (User & { role?: string | null }) | null;
  session: Session | null;
};

export type ApiAuthEnv = {
  Variables: ApiAuthVariables;
};

export type AuthenticatedApiUser = NonNullable<ApiAuthVariables["user"]>;
export type AuthenticatedApiSession = NonNullable<ApiAuthVariables["session"]>;

export const requireAuth = createMiddleware<ApiAuthEnv>(async (c, next) => {
  const session = c.get("session");
  const user = c.get("user");
  if (!user || !session) return c.body(null, 401);
  await next();
});

export function getRequiredAuth(c: Context<ApiAuthEnv>) {
  const session = c.get("session");
  const user = c.get("user");

  if (!user || !session) {
    throw new Error("Authenticated route reached without auth context.");
  }

  return {
    session,
    user,
  } as {
    session: AuthenticatedApiSession;
    user: AuthenticatedApiUser;
  };
}

export function getRequiredUser(c: Context<ApiAuthEnv>) {
  return getRequiredAuth(c).user;
}
