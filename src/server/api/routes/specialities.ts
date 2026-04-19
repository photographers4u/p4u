import { Hono } from "hono";
import type { ApiAuthEnv } from "@/server/api/lib/require-auth-middleware";
import {
  API_CACHE_NAMESPACES,
  getOrSetApiCache,
} from "@/server/api/lib/response-cache";
import { mapError } from "@/server/api/lib/route-helpers";
import { getSpecialities } from "@/server/services/speciality";

const SPECIALITIES_API_CACHE_TTL_SECONDS = 3600;

export const specialitiesRouter = new Hono<ApiAuthEnv>().get("/", async (c) => {
  try {
    const payload = await getOrSetApiCache({
      key: {
        route: "specialities-list",
      },
      loader: async () => {
        const specialities = await getSpecialities();
        return { specialities };
      },
      namespace: API_CACHE_NAMESPACES.specialities,
      ttlSeconds: SPECIALITIES_API_CACHE_TTL_SECONDS,
    });

    return c.json(payload, 200);
  } catch (error) {
    const [status, message] = mapError(error);
    return c.json({ message }, status);
  }
});
