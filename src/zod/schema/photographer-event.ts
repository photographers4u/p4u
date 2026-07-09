import { z } from "zod";

export const photographerContactEventMethodSchema = z.enum([
  "call",
  "email",
]);

export const recordPhotographerContactEventSchema = z.object({
  photographerId: z.string().trim().uuid("Please provide a valid photographer id"),
  method: photographerContactEventMethodSchema,
});

export type PhotographerContactEventMethod = z.infer<
  typeof photographerContactEventMethodSchema
>;
export type RecordPhotographerContactEventInput = z.infer<
  typeof recordPhotographerContactEventSchema
>;
