import z from "zod";
import {
  entitySchema,
  NAME_MAX_LENGTH,
  nameSlugSchema,
  requiredTextSchema,
} from "@/zod/helpers";

const specialityBaseShape = {
  name: requiredTextSchema("Name").max(
    NAME_MAX_LENGTH,
    `Name must be at most ${NAME_MAX_LENGTH} characters`,
  ),
  slug: nameSlugSchema,
};

export const specialityBaseSchema = z.object(specialityBaseShape);

export const specialitySchema = entitySchema(specialityBaseShape);

export const createSpecialitySchema = specialityBaseSchema;

export const updateSpecialitySchema = specialityBaseSchema.partial();

export type Speciality = z.infer<typeof specialitySchema>;
export type CreateSpecialityInput = z.infer<typeof createSpecialitySchema>;
export type UpdateSpecialityInput = z.infer<typeof updateSpecialitySchema>;
