import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { bookmarkController } from "@/server/db/controller/bookmark";
import {
  bookmarkIdentifierParamsSchema,
  bookmarkToggleSchema,
} from "@/zod/schema/bookmark";

export const bookmarkRouter = new Hono<ApiAuthEnv>()
  .get(
    "/:identifier",
    requireAuth,
    zValidator("param", bookmarkIdentifierParamsSchema),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      const { identifier } = c.req.valid("param");
      const values = await bookmarkController.getValuesByIdentifier(
        user.id,
        identifier,
      );

      return c.json({ values }, 200);
    },
  )
  .post(
    "/toggle",
    requireAuth,
    zValidator("json", bookmarkToggleSchema),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      try {
        const result = await bookmarkController.toggleBookmark(
          user.id,
          c.req.valid("json"),
        );

        return c.json(result, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
