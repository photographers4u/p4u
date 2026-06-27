import { CITIES } from "@/zod/helpers";

export type CityName = (typeof CITIES)[number];

export function slugifyCity(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

const SLUG_TO_CITY = new Map<string, CityName>(
  CITIES.map((city) => [slugifyCity(city), city]),
);

// Common search spellings that don't match a CITIES entry exactly.
const CITY_SLUG_ALIASES: Record<string, CityName> = {
  bangalore: "Bengaluru",
  banglore: "Bengaluru",
  bengaluru: "Bengaluru",
  allahabad: "Prayagraj",
};

// Cities we want a landing page for even though we don't have photographer
// data there yet (e.g. not yet onboarded). Keeps the keyword targeted with
// honest "coming soon" content instead of a 404.
export const COMING_SOON_CITIES: Record<string, string> = {
  delhi: "Delhi",
  "new-delhi": "Delhi",
  noida: "Noida",
  gurugram: "Gurugram",
  gurgaon: "Gurugram",
};

export function getCitySlug(city: CityName) {
  return slugifyCity(city);
}

/** Returns the canonical CITIES entry for a slug, resolving aliases. */
export function resolveCityFromSlug(slug: string): CityName | null {
  const normalized = slug.toLowerCase();

  return SLUG_TO_CITY.get(normalized) ?? CITY_SLUG_ALIASES[normalized] ?? null;
}

/** True if this slug should 301 to a different canonical city slug. */
export function getCanonicalCitySlugRedirect(slug: string): string | null {
  const normalized = slug.toLowerCase();

  if (SLUG_TO_CITY.has(normalized)) {
    return null;
  }

  const aliasCity = CITY_SLUG_ALIASES[normalized];

  return aliasCity ? getCitySlug(aliasCity) : null;
}

// Highlighted cities for internal linking (footer, listing page), in
// priority order for the markets we're actively targeting.
export const FEATURED_CITY_LINKS = [
  { slug: "pune", label: "Pune" },
  { slug: "mumbai", label: "Mumbai" },
  { slug: "bengaluru", label: "Bangalore" },
  { slug: "delhi", label: "Delhi" },
  { slug: "hyderabad", label: "Hyderabad" },
  { slug: "chennai", label: "Chennai" },
  { slug: "kolkata", label: "Kolkata" },
  { slug: "ahmedabad", label: "Ahmedabad" },
] as const;
