import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { mapError } from "@/server/api/lib/route-helpers";
import { photographerController } from "@/server/db/controller/photographer";
import { photographerIdParamsSchema } from "@/zod/schema/photographer";

export const photographersRouter = new Hono()
  .get("/", async (c) => {
    const photographers = await photographerController.getPublicPhotographers();

    return c.json({ photographers }, 200);
  })
  .get("/:id", zValidator("param", photographerIdParamsSchema), async (c) => {
    try {
      const photographer =
        await photographerController.getPublicPhotographerById(
          c.req.valid("param").id,
        );

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
