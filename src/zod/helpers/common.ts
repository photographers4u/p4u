import z from "zod";

export const SLUG_LENGTH = 10;
export const NAME_MAX_LENGTH = 255;
export const PASSWORD_MIN_LENGTH = 8;
export const bookmarkIdentifierValues = ["item"] as const;
export const bookmarkIdentifierSchema = z.enum(bookmarkIdentifierValues);

/**
 * Slug rules
 * - exactly 10 characters
 * - lowercase letters and numbers only
 * - URL safe
 */
export const slugSchema = z
  .string()
  .trim()
  .length(SLUG_LENGTH, `Slug must be exactly ${SLUG_LENGTH} characters`)
  .regex(/^[a-z0-9]+$/, "Slug can only contain lowercase letters and numbers");

/**
 * Flexible slug for name-derived identifiers.
 * - lowercase letters, numbers, and dashes only
 * - no length constraint
 */
export const nameSlugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(
    /^[a-z0-9-]+$/,
    "Slug can only contain lowercase letters, numbers, and dashes",
  );

export const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  );
