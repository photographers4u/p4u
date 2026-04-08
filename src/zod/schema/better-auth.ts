import { z } from "zod";
import {
  eventTimestamp,
  idSchema,
  idValueSchema,
  manualTimestamp,
  timestamps,
} from "../helpers/base-schema";

// User

export const userSchema = z.object({
  ...idSchema(),
  name: z.string(),
  email: z.email(),
  emailVerified: z.boolean().default(false),
  image: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  banned: z.boolean().nullable().optional(),
  banReason: z.string().nullable().optional(),
  banExpires: eventTimestamp().optional(),
  ...timestamps(),
});

export type User = z.infer<typeof userSchema>;

// Session

export const sessionSchema = z.object({
  ...idSchema(),
  expiresAt: manualTimestamp(),
  token: z.string(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  impersonatedBy: z.string().nullable().optional(),
  userId: idValueSchema,
  ...timestamps(),
});

// Account

// biome-ignore lint/correctness/noUnusedVariables: <->
const accountSchema = z.object({
  ...idSchema(),
  accountId: z.string(),
  providerId: z.string(),
  userId: idValueSchema,
  accessToken: z.string().nullable().optional(),
  refreshToken: z.string().nullable().optional(),
  idToken: z.string().nullable().optional(),
  accessTokenExpiresAt: eventTimestamp().optional(),
  refreshTokenExpiresAt: eventTimestamp().optional(),
  scope: z.string().nullable().optional(),
  password: z.string().nullable().optional(),
  ...timestamps(),
});

// Verification

// biome-ignore lint/correctness/noUnusedVariables: <->
const verificationSchema = z.object({
  ...idSchema(),
  identifier: z.string(),
  value: z.string(),
  expiresAt: manualTimestamp(),
  ...timestamps(),
});
