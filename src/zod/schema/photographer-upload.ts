import z from "zod";
import { entitySchema, idValueSchema, requiredTextSchema } from "@/zod/helpers";

const photographerUploadBaseShape = {
  photographerId: idValueSchema,
  displayOrder: z.number().int().min(0),
  imageUrl: requiredTextSchema("Image URL"),
};

export const photographerUploadBaseSchema = z.object(
  photographerUploadBaseShape,
);

export const photographerUploadSchema = entitySchema(
  photographerUploadBaseShape,
);

export const createPhotographerUploadSchema = photographerUploadBaseSchema;
export const createPhotographerPortfolioUploadSchema = z.object({
  imageUrl: requiredTextSchema("Image URL"),
});
export const photographerUploadIdParamsSchema = z.object({
  id: idValueSchema,
});
export const reorderPhotographerUploadsSchema = z.object({
  orderedUploadIds: z.array(idValueSchema),
});

export const updatePhotographerUploadSchema =
  photographerUploadBaseSchema.partial();

export type PhotographerUpload = z.infer<typeof photographerUploadSchema>;
export type CreatePhotographerUploadInput = z.infer<
  typeof createPhotographerUploadSchema
>;
export type CreatePhotographerPortfolioUploadInput = z.infer<
  typeof createPhotographerPortfolioUploadSchema
>;
export type PhotographerUploadIdParams = z.infer<
  typeof photographerUploadIdParamsSchema
>;
export type ReorderPhotographerUploadsInput = z.infer<
  typeof reorderPhotographerUploadsSchema
>;
export type UpdatePhotographerUploadInput = z.infer<
  typeof updatePhotographerUploadSchema
>;
