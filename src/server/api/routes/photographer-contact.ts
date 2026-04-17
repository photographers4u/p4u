import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { photographerContactController } from "@/server/db/controller/photographer-contact";
import { savePhotographerContactSchema } from "@/zod/schema";

export const photographerContactRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const contact =
        await photographerContactController.getPhotographerContactByUserId(
          user.id,
        );

      return c.json(contact, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .patch(
    "/",
    requireAuth,
    zValidator("json", savePhotographerContactSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const contact =
          await photographerContactController.savePhotographerContactByUserId(
            user.id,
            c.req.valid("json"),
          );

        return c.json(contact, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
