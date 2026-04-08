import type { Context } from "hono";
import { z } from "zod";
import type { ApiAuthEnv } from "./require-auth-middleware";

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"]);
export const reviewSortBySchema = z.enum(["createdAt", "reviewedAt"]);
export const reviewSortOrderSchema = z.enum(["asc", "desc"]);

export function createReviewListQuerySchema<
  TCategorySchema extends z.ZodTypeAny,
>(
  categorySchema: TCategorySchema,
  options?: {
    defaultLimit?: number;
    maxLimit?: number;
  },
) {
  const defaultLimit = options?.defaultLimit ?? 8;
  const maxLimit = options?.maxLimit ?? 24;

  return z.object({
    status: reviewStatusSchema.optional(),
    category: categorySchema.optional(),
    sortBy: reviewSortBySchema.default("createdAt"),
    sortOrder: reviewSortOrderSchema.default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  });
}

export function getAdminUserOrResponse(c: Context<ApiAuthEnv>) {
  const user = c.get("user");
  const role = (user as { role?: string | null } | null)?.role;

  if (!user) {
    return {
      ok: false as const,
      response: c.body(null, 401),
    };
  }

  if (role !== "admin") {
    return {
      ok: false as const,
      response: c.json({ message: "Admin access required" }, 403),
    };
  }

  return {
    ok: true as const,
    user,
  };
}
