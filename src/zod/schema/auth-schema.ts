import z from "zod";
import { emailSchema, passwordSchema } from "./../helpers/common";

export const emailPasswordAuthSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type EmailPasswordAuth = z.infer<typeof emailPasswordAuthSchema>;
