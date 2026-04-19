import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  deletePortfolioUploadByUserId,
  getPortfolioUploadsByUserId,
  reorderPortfolioUploadsByUserId,
  setPortfolioUploadPinnedByUserId,
} from "@/server/services/photographer-upload";
import {
  photographerUploadIdParamsSchema,
  reorderPhotographerUploadsSchema,
  setPhotographerUploadPinnedSchema,
} from "@/zod/schema/photographer-upload";

export const photographerUploadRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const uploads = await getPortfolioUploadsByUserId(user.id);

      return c.json({ uploads }, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .patch(
    "/:id/pin",
    requireAuth,
    zValidator("param", photographerUploadIdParamsSchema),
    zValidator("json", setPhotographerUploadPinnedSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const uploads = await setPortfolioUploadPinnedByUserId(
          user.id,
          c.req.valid("param").id,
          c.req.valid("json"),
        );

        return c.json({ uploads }, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/reorder",
    requireAuth,
    zValidator("json", reorderPhotographerUploadsSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const uploads = await reorderPortfolioUploadsByUserId(
          user.id,
          c.req.valid("json"),
        );

        return c.json({ uploads }, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .delete(
    "/:id",
    requireAuth,
    zValidator("param", photographerUploadIdParamsSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const result = await deletePortfolioUploadByUserId(
          user.id,
          c.req.valid("param").id,
        );

        return c.json(result, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
