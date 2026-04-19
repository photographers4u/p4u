import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { ApiAuthVariables } from "@/server/api/lib/require-auth-middleware";
import { routes as allRoutes } from "@/server/api/routes";
import { auth } from "@/server/auth";

// Domain APIs live in the Hono surface so web and mobile clients can share
// the same contracts. Keep direct app/api/* handlers only for intentional
// exceptions such as Better Auth adapters and multipart/provider uploads.
const app = new Hono<{
  Variables: ApiAuthVariables;
}>().basePath("/api");

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);

  return next();
});

const routes = app.route("/", allRoutes);

export type AppType = typeof routes;

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
