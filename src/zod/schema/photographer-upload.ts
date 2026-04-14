import z from "zod";
import { entitySchema, idValueSchema, requiredTextSchema } from "@/zod/helpers";

const photographerUploadBaseShape = {
  photographerId: idValueSchema,
  imageUrl: requiredTextSchema("Image URL"),
};

export const photographerUploadBaseSchema = z.object(
  photographerUploadBaseShape,
);

export const photographerUploadSchema = entitySchema(
  photographerUploadBaseShape,
);

export const createPhotographerUploadSchema = photographerUploadBaseSchema;

export const updatePhotographerUploadSchema =
  photographerUploadBaseSchema.partial();

export type PhotographerUpload = z.infer<typeof photographerUploadSchema>;
export type CreatePhotographerUploadInput = z.infer<
  typeof createPhotographerUploadSchema
>;
export type UpdatePhotographerUploadInput = z.infer<
  typeof updatePhotographerUploadSchema
>;
