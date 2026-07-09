import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { recordContactClick } from "@/server/services/photographer-event";
import { recordPhotographerContactEventSchema } from "@/zod/schema/photographer-event";

export const photographerEventRouter = new Hono<ApiAuthEnv>().post(
  "/contact",
  requireAuth,
  zValidator("json", recordPhotographerContactEventSchema),
  async (c) => {
    try {
      const user = getRequiredUser(c);
      const { photographerId, method } = c.req.valid("json");

      await recordContactClick({
        photographerId,
        viewerUserId: user.id,
        method,
      });

      return c.json({ ok: true }, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  },
);
