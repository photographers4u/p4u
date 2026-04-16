import z from "zod";
import {
  emailSchema,
  entitySchema,
  idValueSchema,
  requiredTextSchema,
} from "@/zod/helpers";

const photographerContactInputShape = {
  phone: requiredTextSchema("Phone"),
  email: emailSchema,
  isPublic: z.boolean().default(false),
};

const photographerContactBaseShape = {
  photographerId: idValueSchema,
  ...photographerContactInputShape,
  emailVerified: z.boolean().default(false),
};

export const savePhotographerContactSchema = z.object(
  photographerContactInputShape,
);

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
export type SavePhotographerContactInput = z.infer<
  typeof savePhotographerContactSchema
>;
export type UpdatePhotographerContactInput = z.infer<
  typeof updatePhotographerContactSchema
>;
