import type { Session, User } from "better-auth";
import { createMiddleware } from "hono/factory";

export type ApiAuthVariables = {
  user: (User & { role?: string | null }) | null;
  session: Session | null;
};

export type ApiAuthEnv = {
  Variables: ApiAuthVariables;
};

export const requireAuth = createMiddleware<ApiAuthEnv>(async (c, next) => {
  const session = c.get("session");
  const user = c.get("user");
  if (!user || !session) return c.body(null, 401);
  await next();
});
