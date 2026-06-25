import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import {
  API_CACHE_NAMESPACES,
  invalidateApiCacheNamespaces,
} from "@/server/api/lib/response-cache";
import { getAdminUserOrResponse } from "@/server/api/lib/review-workflow";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  createAdminPhotographer,
  syncAdminPhotographerSpecialitiesById,
  updateAdminPhotographerAvatarById,
  updateAdminPhotographerContactById,
  updateAdminPhotographerProfileById,
} from "@/server/services/admin-photographer";
import { getAdminPhotographerEntryById } from "@/server/services/photographer";
import {
  deletePortfolioUploadByPhotographerId,
  reorderPortfolioUploadsByPhotographerId,
  setPortfolioUploadPinnedByPhotographerId,
} from "@/server/services/photographer-upload";
import { idValueSchema } from "@/zod/helpers";
import {
  createAdminPhotographerSchema,
  photographerIdParamsSchema,
  savePhotographerAvatarStepSchema,
  syncAdminPhotographerSpecialitiesSchema,
  updatePhotographerProfileSchema,
} from "@/zod/schema/photographer";
import { savePhotographerContactSchema } from "@/zod/schema/photographer-contact";
import {
  reorderPhotographerUploadsSchema,
  setPhotographerUploadPinnedSchema,
} from "@/zod/schema/photographer-upload";

const PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES = [
  API_CACHE_NAMESPACES.publicPhotographerDirectory,
  API_CACHE_NAMESPACES.publicPhotographerDetails,
] as const;
const PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS = 300;

const photographerUploadIdParamsSchema = z.object({
  id: idValueSchema,
  uploadId: idValueSchema,
});

async function invalidatePhotographerCacheIfPublished(photographerId: string) {
  const entry = await getAdminPhotographerEntryById(photographerId);

  if (entry.isPublished) {
    await invalidateApiCacheNamespaces(
      [...PHOTOGRAPHER_MUTATION_CACHE_NAMESPACES],
      {
        bypassSeconds: PUBLIC_PHOTOGRAPHER_CACHE_INVALIDATION_BYPASS_SECONDS,
      },
    );
  }
}

export const adminPhotographerRouter = new Hono<ApiAuthEnv>()
  .post(
    "/",
    requireAuth,
    zValidator("json", createAdminPhotographerSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const result = await createAdminPhotographer(c.req.valid("json"));

        return c.json(result, 201);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/profile",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", updatePhotographerProfileSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const id = c.req.valid("param").id;
        const entry = await updateAdminPhotographerProfileById(
          id,
          c.req.valid("json"),
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json(entry, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/avatar",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", savePhotographerAvatarStepSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const id = c.req.valid("param").id;
        const entry = await updateAdminPhotographerAvatarById(
          id,
          c.req.valid("json").avatar,
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json(entry, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/contact",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", savePhotographerContactSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const id = c.req.valid("param").id;
        const contact = await updateAdminPhotographerContactById(
          id,
          c.req.valid("json"),
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json(contact, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/specialities",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", syncAdminPhotographerSpecialitiesSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const id = c.req.valid("param").id;
        const entry = await syncAdminPhotographerSpecialitiesById(
          id,
          c.req.valid("json").specialities,
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json(entry, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/uploads/:uploadId/pin",
    requireAuth,
    zValidator("param", photographerUploadIdParamsSchema),
    zValidator("json", setPhotographerUploadPinnedSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const { id, uploadId } = c.req.valid("param");
        const uploads = await setPortfolioUploadPinnedByPhotographerId(
          id,
          uploadId,
          c.req.valid("json"),
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json({ uploads }, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .patch(
    "/:id/uploads/reorder",
    requireAuth,
    zValidator("param", photographerIdParamsSchema),
    zValidator("json", reorderPhotographerUploadsSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const id = c.req.valid("param").id;
        const uploads = await reorderPortfolioUploadsByPhotographerId(
          id,
          c.req.valid("json"),
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json({ uploads }, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .delete(
    "/:id/uploads/:uploadId",
    requireAuth,
    zValidator("param", photographerUploadIdParamsSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const { id, uploadId } = c.req.valid("param");
        const result = await deletePortfolioUploadByPhotographerId(
          id,
          uploadId,
        );
        await invalidatePhotographerCacheIfPublished(id);

        return c.json(result, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
