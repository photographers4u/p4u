import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import {
  API_CACHE_NAMESPACES,
  invalidateApiCacheNamespaces,
} from "@/server/api/lib/response-cache";
import { getAdminUserOrResponse } from "@/server/api/lib/review-workflow";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  deletePhotographerByUserId,
  getPhotographerOnboardingByUserId,
  getPhotographerProfileByUserId,
  reviewPhotographerById,
  savePhotographerAvatarByUserId,
  savePhotographerOnboardingStepByUserId,
  setPhotographerFeaturedById,
  updatePhotographerProfileByUserId,
} from "@/server/services/photographer";
import {
  photographerIdParamsSchema,
  reviewPhotographerSchema,
  savePhotographerAvatarStepSchema,
  savePhotographerOnboardingStepRequestSchema,
  setPhotographerFeaturedSchema,
  updatePhotographerProfileSchema,
} from "@/zod/schema/photographer";

const PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES = [
  API_CACHE_NAMESPACES.publicPhotographerDirectory,
  API_CACHE_NAMESPACES.publicPhotographerDetails,
] as const;
const PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS = 300;

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

        if (photographer.isPublished) {
          await invalidateApiCacheNamespaces(
            [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
            {
              bypassSeconds:
                PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
            },
          );
        }

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

        if (photographer.isPublished) {
          await invalidateApiCacheNamespaces(
            [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
            {
              bypassSeconds:
                PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
            },
          );
        }

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
        await invalidateApiCacheNamespaces(
          [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
          {
            bypassSeconds:
              PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
          },
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/feature",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", setPhotographerFeaturedSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const photographer = await setPhotographerFeaturedById(
          c.req.valid("param").id,
          c.req.valid("json").isFeatured,
        );
        await invalidateApiCacheNamespaces(
          [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
          {
            bypassSeconds:
              PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
          },
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

      if (photographer.isPublished) {
        await invalidateApiCacheNamespaces(
          [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
          {
            bypassSeconds:
              PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
          },
        );
      }

      return c.json(photographer, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  });
