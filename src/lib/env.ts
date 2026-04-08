import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]),
    BETTER_AUTH_SECRET: z.string().min(1),
    IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
    IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
    RESEND_API_KEY: z.string().min(1),
    DATABASE_URL: z.string().min(1),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    EMAIL_FROM_NAME: z.string().min(1),
    EMAIL_FROM_ADDRESS: z.string().email(),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().min(1),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
    EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS,
  },
});

export const getEnvVariable = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }

  return value;
};
