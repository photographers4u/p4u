import z from "zod";
import { entitySchema, idValueSchema } from "@/zod/helpers";

const startingPriceSchema = z
  .union([
    z.number(),
    z.string().trim().min(1, "Starting price is required"),
  ])
  .transform((value) => Number(value))
  .pipe(
    z.number().int().min(0, "Starting price must be 0 or greater"),
  );

const photographerSpecialityBaseShape = {
  photographerId: idValueSchema,
  specialityId: idValueSchema,
  startingPrice: startingPriceSchema,
};

export const photographerSpecialityBaseSchema = z.object(
  photographerSpecialityBaseShape,
);

export const photographerSpecialitySchema = entitySchema(
  photographerSpecialityBaseShape,
);

export const createPhotographerSpecialitySchema =
  photographerSpecialityBaseSchema;

export const updatePhotographerSpecialitySchema =
  photographerSpecialityBaseSchema.partial();

export type PhotographerSpeciality = z.infer<
  typeof photographerSpecialitySchema
>;
export type CreatePhotographerSpecialityInput = z.infer<
  typeof createPhotographerSpecialitySchema
>;
export type UpdatePhotographerSpecialityInput = z.infer<
  typeof updatePhotographerSpecialitySchema
>;
