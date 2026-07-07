import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  getNotificationListByUserId,
  markAllNotificationsReadByUserId,
  markNotificationReadByUserId,
} from "@/server/services/notification";
import { notificationIdParamsSchema } from "@/zod/schema/notification";

export const notificationRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const payload = await getNotificationListByUserId(user.id);

      return c.json(payload, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .post(
    "/:id/read",
    requireAuth,
    zValidator("param", notificationIdParamsSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const { id } = c.req.valid("param");
        const notification = await markNotificationReadByUserId(id, user.id);

        return c.json(notification, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .post("/read-all", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      await markAllNotificationsReadByUserId(user.id);

      return c.json({ success: true }, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
