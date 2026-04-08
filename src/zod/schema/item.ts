import { z } from "zod";

export const itemSchema = z.object({
  id: z.string().uuid(),
  title: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const createItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
});

export type Item = z.infer<typeof itemSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
