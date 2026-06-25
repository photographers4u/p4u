import { customAlphabet } from "nanoid";
import { SLUG_LENGTH } from "./common";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid6 = customAlphabet(alphabet, 6);
const photographerSlugNanoid8 = customAlphabet(alphabet, 8);
const passwordAlphabet =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
const passwordNanoid16 = customAlphabet(passwordAlphabet, 16);

/**
 * Generates a random password for admin-created photographer accounts.
 * Excludes visually ambiguous characters (0/O, 1/l/I).
 */
export function generateRandomPassword() {
  return passwordNanoid16();
}

export const slugNanoid = () => {
  return customAlphabet(alphabet, SLUG_LENGTH)();
};

function normalizeSlugPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Derives a URL-safe slug from a human name with a 6-char nanoid suffix.
 * e.g. "John Doe" -> "john-doe-a1b2c3"
 */
export function slugFromName(name: string): string {
  const base = normalizeSlugPart(name).slice(0, 40) || "entry";
  return `${base}-${nanoid6()}`;
}

export function photographerSlugSuffix() {
  return photographerSlugNanoid8();
}

export function photographerSlugBaseFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = normalizeSlugPart(parts[0] ?? "");
  const lastName =
    parts.length > 1 ? normalizeSlugPart(parts.at(-1) ?? "") : "";

  return (
    [firstName, lastName].filter(Boolean).join("-") ||
    normalizeSlugPart(name) ||
    "photographer"
  );
}

/**
 * Builds a public photographer slug in the format:
 * first-name-last-name-abcdefgh
 */
export function photographerSlugFromName(name: string): string {
  return `${photographerSlugBaseFromName(name)}-${photographerSlugSuffix()}`;
}
