import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import type { ApiAuthEnv } from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { photographerController } from "@/server/db/controller/photographer";
import { photographerSlugParamsSchema } from "@/zod/schema/photographer";

export const photographersRouter = new Hono<ApiAuthEnv>()
  .get("/", async (c) => {
    const photographers = await photographerController.getPublicPhotographers();

    return c.json({ photographers }, 200);
  })
  .get(
    "/:slug",
    zValidator("param", photographerSlugParamsSchema),
    async (c) => {
      try {
        const photographer =
          await photographerController.getPublicPhotographerBySlug(
            c.req.valid("param").slug,
            {
              includeContactDetails: Boolean(c.get("user")),
            },
          );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
