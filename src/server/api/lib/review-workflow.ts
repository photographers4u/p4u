import type { Context } from "hono";
import { z } from "zod";
import { reviewStatusSchema } from "@/zod/helpers";
import { getRequiredUser, type ApiAuthEnv } from "./require-auth-middleware";

export const reviewSortBySchema = z.enum(["createdAt", "reviewedAt"]);
export const reviewSortOrderSchema = z.enum(["asc", "desc"]);

export function createReviewListQuerySchema<
  TCategorySchema extends z.ZodTypeAny,
  TStatusSchema extends z.ZodTypeAny = typeof reviewStatusSchema,
>(
  categorySchema: TCategorySchema,
  options?: {
    defaultLimit?: number;
    maxLimit?: number;
    statusSchema?: TStatusSchema;
  },
) {
  const defaultLimit = options?.defaultLimit ?? 8;
  const maxLimit = options?.maxLimit ?? 24;
  const statusSchema = options?.statusSchema ?? reviewStatusSchema;

  return z.object({
    status: statusSchema.optional(),
    category: categorySchema.optional(),
    sortBy: reviewSortBySchema.default("createdAt"),
    sortOrder: reviewSortOrderSchema.default("desc"),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(maxLimit).default(defaultLimit),
  });
}

export function getAdminUserOrResponse(c: Context<ApiAuthEnv>) {
  const user = getRequiredUser(c);
  const role = user.role;

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
