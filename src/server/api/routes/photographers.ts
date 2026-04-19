import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  getPublicPhotographerExploreFilters,
  getPublicPhotographerExplorePageFromParams,
  publicPhotographerExploreQuerySchema,
} from "@/lib/public-photographer-explore";
import type { ApiAuthEnv } from "@/server/api/lib/require-auth-middleware";
import {
  API_CACHE_NAMESPACES,
  getOrSetApiCache,
} from "@/server/api/lib/response-cache";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  getPublicPhotographerBySlug,
  getPublicPhotographerExplorePage,
  getPublicPhotographers,
  getPublicPhotographersByIds,
} from "@/server/services/photographer";
import {
  photographerSlugParamsSchema,
  publicPhotographerListQuerySchema,
} from "@/zod/schema/photographer";

const PUBLIC_PHOTOGRAPHERS_API_CACHE_TTL_SECONDS = 300;
const PUBLIC_PHOTOGRAPHERS_EXPLORE_API_CACHE_TTL_SECONDS = 180;

export const photographersRouter = new Hono<ApiAuthEnv>()
  .get(
    "/",
    zValidator("query", publicPhotographerListQuerySchema),
    async (c) => {
      try {
        const query = c.req.valid("query");
        const ids = query.id
          ? Array.isArray(query.id)
            ? query.id
            : [query.id]
          : null;

        if (ids) {
          const photographers = await getPublicPhotographersByIds(ids);
          return c.json({ photographers }, 200);
        }

        const payload = await getOrSetApiCache({
          key: {
            route: "public-photographers-list",
          },
          loader: async () => ({
            photographers: await getPublicPhotographers(),
          }),
          namespace: API_CACHE_NAMESPACES.publicPhotographerDirectory,
          ttlSeconds: PUBLIC_PHOTOGRAPHERS_API_CACHE_TTL_SECONDS,
        });

        return c.json(payload, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .get(
    "/explore",
    zValidator("query", publicPhotographerExploreQuerySchema),
    async (c) => {
      try {
        const query = c.req.valid("query");
        const filters = getPublicPhotographerExploreFilters(query);
        const page = getPublicPhotographerExplorePageFromParams(query);
        const payload = await getOrSetApiCache({
          key: {
            filters,
            page,
            route: "public-photographers-explore",
          },
          loader: () =>
            getPublicPhotographerExplorePage(filters, {
              page,
            }),
          namespace: API_CACHE_NAMESPACES.publicPhotographerDirectory,
          ttlSeconds: PUBLIC_PHOTOGRAPHERS_EXPLORE_API_CACHE_TTL_SECONDS,
        });

        return c.json(payload, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  )
  .get(
    "/:slug",
    zValidator("param", photographerSlugParamsSchema),
    async (c) => {
      try {
        const { slug } = c.req.valid("param");
        const includeContactDetails = Boolean(c.get("user"));
        const payload = await getOrSetApiCache({
          key: {
            includeContactDetails,
            route: "public-photographer-detail",
            slug,
          },
          loader: () =>
            getPublicPhotographerBySlug(slug, {
              includeContactDetails,
            }),
          namespace: API_CACHE_NAMESPACES.publicPhotographerDetails,
          ttlSeconds: PUBLIC_PHOTOGRAPHERS_API_CACHE_TTL_SECONDS,
        });

        return c.json(payload, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
