import z from "zod";
import {
  emailSchema,
  entitySchema,
  idValueSchema,
  requiredTextSchema,
} from "@/zod/helpers";

const photographerContactBaseShape = {
  photographerId: idValueSchema,
  phone: requiredTextSchema("Phone"),
  email: emailSchema,
  emailVerified: z.boolean().default(false),
  isPublic: z.boolean().default(false),
};

export const photographerContactBaseSchema = z.object(
  photographerContactBaseShape,
);

export const photographerContactSchema = entitySchema(
  photographerContactBaseShape,
);

export const createPhotographerContactSchema = photographerContactBaseSchema;

export const updatePhotographerContactSchema =
  photographerContactBaseSchema.partial();

export type PhotographerContact = z.infer<typeof photographerContactSchema>;
export type CreatePhotographerContactInput = z.infer<
  typeof createPhotographerContactSchema
>;
export type UpdatePhotographerContactInput = z.infer<
  typeof updatePhotographerContactSchema
>;
