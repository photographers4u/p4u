import { z } from "zod";
import { bookmarkIdentifierSchema } from "@/zod/helpers";

export const bookmarkValueSchema = z
  .string()
  .trim()
  .uuid("Please provide a valid photographer id");

export const bookmarkSchema = z.object({
  userId: z.string().uuid(),
  identifier: bookmarkIdentifierSchema,
  value: bookmarkValueSchema,
  createdAt: z.coerce.date(),
});

export const bookmarkToggleSchema = z.object({
  identifier: bookmarkIdentifierSchema,
  value: bookmarkValueSchema,
});

export const bookmarkIdentifierParamsSchema = z.object({
  identifier: bookmarkIdentifierSchema,
});

export type Bookmark = z.infer<typeof bookmarkSchema>;
export type BookmarkToggleInput = z.infer<typeof bookmarkToggleSchema>;
export type BookmarkIdentifier = z.infer<typeof bookmarkIdentifierSchema>;
