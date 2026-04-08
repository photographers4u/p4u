import { Hono } from "hono";
import { handle } from "hono/vercel";
import type { ApiAuthVariables } from "@/server/api/lib/require-auth-middleware";
import { routes as allRoutes } from "@/server/api/routes";
import { auth } from "@/server/auth";

const app = new Hono<{
  Variables: ApiAuthVariables;
}>().basePath("/api");

app.get("/hello", (c) => {
  return c.json({
    message: "Hello Next.js!",
  });
});

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
