import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { getAdminUserOrResponse } from "@/server/api/lib/review-workflow";
import { mapError } from "@/server/api/lib/route-helpers";
import { photographerController } from "@/server/db/controller/photographer";
import {
  createPhotographerProfileSchema,
  photographerIdParamsSchema,
  reviewPhotographerSchema,
  savePhotographerAvatarStepSchema,
  savePhotographerOnboardingStepRequestSchema,
  updatePhotographerProfileSchema,
} from "@/zod/schema/photographer";

export const photographerRouter = new Hono<ApiAuthEnv>()
  .get("/onboarding", requireAuth, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.body(null, 401);
    }

    try {
      const photographer =
        await photographerController.getPhotographerOnboardingByUserId(user.id);

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .get("/", requireAuth, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.body(null, 401);
    }

    try {
      const photographer = await photographerController.getPhotographerByUserId(
        user.id,
      );

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
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      try {
        const photographer =
          await photographerController.savePhotographerAvatarStep(
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
  .post(
    "/",
    requireAuth,
    zValidator("json", createPhotographerProfileSchema),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      try {
        const photographer = await photographerController.createPhotographer(
          user.id,
          c.req.valid("json"),
        );

        return c.json(photographer, 201);
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
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      try {
        const photographer =
          await photographerController.updatePhotographerProfile(
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
      const user = c.get("user");

      if (!user) {
        return c.body(null, 401);
      }

      try {
        const photographer =
          await photographerController.savePhotographerOnboardingStep(
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
        const photographer = await photographerController.reviewPhotographer(
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
    const user = c.get("user");

    if (!user) {
      return c.body(null, 401);
    }

    try {
      const photographer = await photographerController.deletePhotographer(
        user.id,
      );

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
