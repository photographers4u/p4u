import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  type ApiAuthEnv,
  requireAuth,
} from "@/server/api/lib/require-auth-middleware";
import { getAdminUserOrResponse } from "@/server/api/lib/review-workflow";
import { mapError } from "@/server/api/lib/route-helpers";
import {
  createAdminStaff,
  listAdminStaff,
} from "@/server/services/admin-staff";
import { createAdminStaffSchema } from "@/zod/schema/admin-staff";

export const adminStaffRouter = new Hono<ApiAuthEnv>()
  .get("/", requireAuth, async (c) => {
    const adminUserResult = getAdminUserOrResponse(c);

    if (!adminUserResult.ok) {
      return adminUserResult.response;
    }

    const staff = await listAdminStaff();

    return c.json({ staff }, 200);
  })
  .post(
    "/",
    requireAuth,
    zValidator("json", createAdminStaffSchema),
    async (c) => {
      const adminUserResult = getAdminUserOrResponse(c);

      if (!adminUserResult.ok) {
        return adminUserResult.response;
      }

      try {
        const result = await createAdminStaff(c.req.valid("json"));

        return c.json(result, 201);
      } catch (error) {
        const [status, message] = mapError(error);
        return c.json({ message }, status);
      }
    },
  );
