import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { getAdminUserOrResponse } from "@/server/api/lib/review-workflow";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  deletePhotographerByUserId,
  getPhotographerOnboardingByUserId,
  getPhotographerProfileByUserId,
  reviewPhotographerById,
  savePhotographerAvatarByUserId,
  savePhotographerOnboardingStepByUserId,
  updatePhotographerProfileByUserId,
} from "@/server/services/photographer";
import {
  photographerIdParamsSchema,
  reviewPhotographerSchema,
  savePhotographerAvatarStepSchema,
  savePhotographerOnboardingStepRequestSchema,
  updatePhotographerProfileSchema,
} from "@/zod/schema/photographer";

export const photographerRouter = new Hono<ApiAuthEnv>()
  .get("/onboarding", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const photographer = await getPhotographerOnboardingByUserId(user.id);

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const photographer = await getPhotographerProfileByUserId(user.id);

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .post(
    "/avatar",
    requireAuth,
    zValidator("json", savePhotographerAvatarStepSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const photographer = await savePhotographerAvatarByUserId(
          user.id,
          c.req.valid("json"),
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/",
    requireAuth,
    zValidator("json", updatePhotographerProfileSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const photographer = await updatePhotographerProfileByUserId(
          user.id,
          c.req.valid("json"),
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/onboarding",
    requireAuth,
    zValidator("json", savePhotographerOnboardingStepRequestSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const photographer = await savePhotographerOnboardingStepByUserId(
          user.id,
          c.req.valid("json"),
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/review",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", reviewPhotographerSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const photographer = await reviewPhotographerById(
          c.req.valid("param").id,
          adminUserResult.user.id,
          c.req.valid("json"),
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .delete("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const photographer = await deletePhotographerByUserId(user.id);

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
