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
import { mapError } from "@/server/api/lib/route-helpers";
import {
  getPhotographerContactByUserId,
  savePhotographerContactByUserId,
} from "@/server/services/photographer";
import { savePhotographerContactSchema } from "@/zod/schema";

const PUBLIC_PHOTOGRAPHER_DETAIL_CACHE_INVALIDATION_BYPASS_SECONDS = 300;

export const photographerContactRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const contact = await getPhotographerContactByUserId(user.id);

      return c.json(contact, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .patch(
    "/",
    requireAuth,
    zValidator("json", savePhotographerContactSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const contact = await savePhotographerContactByUserId(
          user.id,
          c.req.valid("json"),
        );
        await invalidateApiCacheNamespaces(
          [API_CACHE_NAMESPACES.publicPhotographerDetails],
          {
            bypassSeconds:
              PUBLIC_PHOTOGRAPHER_DETAIL_CACHE_INVALIDATION_BYPASS_SECONDS,
          },
        );

        return c.json(contact, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
