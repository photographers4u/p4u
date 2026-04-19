import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  getPublicPhotographerExploreFilters,
  getPublicPhotographerExplorePageFromParams,
  publicPhotographerExploreQuerySchema,
} from "@/lib/public-photographer-explore";
import type { ApiAuthEnv } from "@/server/api/lib/require-auth-middleware";
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
        const photographers = ids
          ? await getPublicPhotographersByIds(ids)
          : await getPublicPhotographers();

        return c.json({ photographers }, 200);
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
        const photographers = await getPublicPhotographerExplorePage(filters, {
          page,
        });

        return c.json(photographers, 200);
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
        const photographer = await getPublicPhotographerBySlug(
          c.req.valid("param").slug,
          {
            includeContactDetails: Boolean(c.get("user")),
          },
        );

        return c.json(photographer, 200);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
