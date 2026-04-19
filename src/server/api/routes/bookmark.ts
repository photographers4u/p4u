import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  getRequiredUser,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import {
  getBookmarkApiCacheNamespace,
  getOrSetApiCache,
  invalidateApiCacheNamespaces,
} from "@/server/api/lib/response-cache";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  getBookmarkStoreByUserId,
  getBookmarkValuesByIdentifier,
  toggleBookmarkByUserId,
} from "@/server/services/bookmark";
import {
  bookmarkIdentifierParamsSchema,
  bookmarkToggleSchema,
} from "@/zod/schema/bookmark";

const BOOKMARKS_API_CACHE_TTL_SECONDS = 60;

export const bookmarkRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    try {
      const user = getRequiredUser(c);
      const payload = await getOrSetApiCache({
        key: {
          route: "bookmark-store",
        },
        loader: () => getBookmarkStoreByUserId(user.id),
        namespace: getBookmarkApiCacheNamespace(user.id),
        ttlSeconds: BOOKMARKS_API_CACHE_TTL_SECONDS,
      });

      return c.json(payload, 200);
    } catch (error) {
      const [status, message] = mapError(error);
      return c.json({ message }, status);
    }
  })
  .get(
    "/:identifier",
    requireAuth,
    zValidator("param", bookmarkIdentifierParamsSchema),
    async (c) => {
      const user = getRequiredUser(c);
      const { identifier } = c.req.valid("param");
      const payload = await getOrSetApiCache({
        key: {
          identifier,
          route: "bookmark-values",
        },
        loader: async () => {
          const values = await getBookmarkValuesByIdentifier(
            user.id,
            identifier,
          );

          return { values };
        },
        namespace: getBookmarkApiCacheNamespace(user.id),
        ttlSeconds: BOOKMARKS_API_CACHE_TTL_SECONDS,
      });

      return c.json(payload, 200);
    },
  )
  .post(
    "/toggle",
    requireAuth,
    zValidator("json", bookmarkToggleSchema),
    async (c) => {
      try {
        const user = getRequiredUser(c);
        const result = await toggleBookmarkByUserId(
          user.id,
          c.req.valid("json"),
        );
        await invalidateApiCacheNamespaces(
          [getBookmarkApiCacheNamespace(user.id)],
          {
            bypassSeconds: BOOKMARKS_API_CACHE_TTL_SECONDS,
          },
        );

        return c.json(result, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
