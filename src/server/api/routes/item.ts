import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { itemController } from "@/server/db/controller/item";
import { createItemSchema, updateItemSchema } from "@/zod/schema/item";

function ensureAdmin(c: Context<ApiAuthEnv>) {
  const user = c.get("user");

  if (!user || user.role !== "admin") {
    return c.json({ message: "Only admins can manage items." }, 403);
  }

  return null;
}

export const itemRouter = new Hono<ApiAuthEnv>()
  .get("/", async (c) => {
    const items = await itemController.getAllItems();
    return c.json({ items }, 200);
  })
  .get("/:id", async (c) => {
    try {
      const item = await itemController.getItemById(c.req.param("id"));
      return c.json(item, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .post("/", requireAuth, zValidator("json", createItemSchema), async (c) => {
    const adminResponse = ensureAdmin(c);

    if (adminResponse) {
      return adminResponse;
    }

    try {
      const item = await itemController.createItem(c.req.valid("json"));
      return c.json(item, 201);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .patch(
    "/:id",
    requireAuth,
    zValidator("json", updateItemSchema),
    async (c) => {
      const adminResponse = ensureAdmin(c);

      if (adminResponse) {
        return adminResponse;
      }

      try {
        const item = await itemController.updateItem(
          c.req.param("id"),
          c.req.valid("json"),
        );
        return c.json(item, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .delete("/:id", requireAuth, async (c) => {
    const adminResponse = ensureAdmin(c);

    if (adminResponse) {
      return adminResponse;
    }

    try {
      const item = await itemController.deleteItem(c.req.param("id"));
      return c.json(item, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
