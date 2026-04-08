import { customAlphabet } from "nanoid";
import { SLUG_LENGTH } from "./common";

const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
const nanoid6 = customAlphabet(alphabet, 6);

export const slugNanoid = () => {
  return customAlphabet(alphabet, SLUG_LENGTH)();
};

/**
 * Derives a URL-safe slug from a human name with a 6-char nanoid suffix.
 * e.g. "John Doe" → "john-doe-a1b2c3"
 */
export function slugFromName(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base}-${nanoid6()}`;
}
