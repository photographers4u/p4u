import { Hono } from "hono";
import type { ApiAuthEnv } from "@/server/api/lib/require-auth-middleware";
import { mapError } from "@/server/api/lib/route-helpers";
import { getSpecialities } from "@/server/services/speciality";

export const specialitiesRouter = new Hono<ApiAuthEnv>().get("/", async (c) => {
  try {
    const specialities = await getSpecialities();
    return c.json({ specialities }, 200);
  } catch (error) {
    const [status, message] = mapError(error);
    return c.json({ message }, status);
  }
});
