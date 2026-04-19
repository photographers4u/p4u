import { z } from "zod";
import {
  getSearchParamFirstValue,
  getSearchParamValues,
  parsePositiveIntSearchParam,
  type SearchParamsRecord,
  type SearchParamValue,
} from "@/lib/search-params";
import { CITIES, EXPERIENCE_YEARS, NAME_MAX_LENGTH } from "@/zod/helpers";

export const PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS = [
  "newest",
  "oldest",
  "name_asc",
  "name_desc",
] as const;

export type PublicPhotographerExploreSort =
  (typeof PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS)[number];

export type PublicPhotographerExploreFilters = {
  experience: (typeof EXPERIENCE_YEARS)[number] | null;
  location: (typeof CITIES)[number] | null;
  query: string;
  sort: PublicPhotographerExploreSort;
  specialities: string[];
};

const DEFAULT_QUERY = "";
const DEFAULT_SPECIALITIES: string[] = [];
const sortSet = new Set<string>(PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS);
const experienceSet = new Set<string>(EXPERIENCE_YEARS);
const locationSet = new Set<string>(CITIES);
const MAX_SPECIALITY_FILTERS = 12;
export const PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE = 12;
const rawSearchParamSchema = z
  .union([z.string(), z.array(z.string())])
  .optional();

export const publicPhotographerExploreQuerySchema = z.object({
  experience: rawSearchParamSchema,
  location: rawSearchParamSchema,
  page: rawSearchParamSchema,
  q: rawSearchParamSchema,
  sort: rawSearchParamSchema,
  speciality: rawSearchParamSchema,
});

export const DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT: PublicPhotographerExploreSort =
  "newest";

export const DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS: PublicPhotographerExploreFilters =
  {
    experience: null,
    location: null,
    query: DEFAULT_QUERY,
    sort: DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT,
    specialities: DEFAULT_SPECIALITIES,
  };

function normalizeQuery(value: string | undefined) {
  return value?.trim().slice(0, NAME_MAX_LENGTH) ?? DEFAULT_QUERY;
}

function isPublicPhotographerExploreSort(
  value: string | undefined,
): value is PublicPhotographerExploreSort {
  return typeof value === "string" && sortSet.has(value);
}

function isExperienceValue(
  value: string | undefined,
): value is (typeof EXPERIENCE_YEARS)[number] {
  return typeof value === "string" && experienceSet.has(value);
}

function isLocationValue(
  value: string | undefined,
): value is (typeof CITIES)[number] {
  return typeof value === "string" && locationSet.has(value);
}

function isSpecialitySlug(value: string) {
  return /^[a-z0-9-]+$/.test(value);
}

function normalizeSpecialities(values: SearchParamValue) {
  const seen = new Set<string>();

  return getSearchParamValues(values)
    .flatMap((value) => value.split(","))
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.length > 0 && isSpecialitySlug(value))
    .filter((value) => {
      if (seen.has(value)) {
        return false;
      }

      seen.add(value);
      return true;
    })
    .slice(0, MAX_SPECIALITY_FILTERS);
}

export function getPublicPhotographerExploreFilters(
  params: SearchParamsRecord,
): PublicPhotographerExploreFilters {
  const query = normalizeQuery(getSearchParamFirstValue(params.q));
  const sort = getSearchParamFirstValue(params.sort);
  const experience = getSearchParamFirstValue(params.experience);
  const location = getSearchParamFirstValue(params.location);

  return {
    experience: isExperienceValue(experience) ? experience : null,
    location: isLocationValue(location) ? location : null,
    query,
    sort: isPublicPhotographerExploreSort(sort)
      ? sort
      : DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT,
    specialities: normalizeSpecialities(params.speciality),
  };
}

export function getPublicPhotographerExplorePageFromParams(
  params: SearchParamsRecord,
) {
  return parsePositiveIntSearchParam(params.page);
}

export function buildPublicPhotographerExploreApiQuery(
  filters: PublicPhotographerExploreFilters,
  options?: {
    page?: number;
  },
) {
  const query: Record<string, string | string[]> = {};

  if (filters.query) {
    query.q = filters.query;
  }

  if (filters.sort !== DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT) {
    query.sort = filters.sort;
  }

  if (filters.experience) {
    query.experience = filters.experience;
  }

  if (filters.location) {
    query.location = filters.location;
  }

  if (filters.specialities.length > 0) {
    query.speciality = filters.specialities;
  }

  if (options?.page && options.page > 1) {
    query.page = String(options.page);
  }

  return query;
}

export function buildPublicPhotographerExploreSearchParams(
  filters: PublicPhotographerExploreFilters,
  options?: {
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();
  const query = buildPublicPhotographerExploreApiQuery(filters, options);

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        searchParams.append(key, entry);
      }
      continue;
    }

    searchParams.set(key, value);
  }

  return searchParams;
}

export function getPublicPhotographerExploreSortLabel(
  sort: PublicPhotographerExploreSort,
) {
  switch (sort) {
    case "oldest":
      return "Oldest";
    case "name_asc":
      return "Name A-Z";
    case "name_desc":
      return "Name Z-A";
    default:
      return "Newest";
  }
}

export function getPublicPhotographerExploreDialogFilterCount(
  filters: Pick<
    PublicPhotographerExploreFilters,
    "experience" | "location" | "specialities"
  >,
) {
  return (
    Number(Boolean(filters.experience)) +
    Number(Boolean(filters.location)) +
    filters.specialities.length
  );
}

export function hasActivePublicPhotographerExploreFilters(
  filters: PublicPhotographerExploreFilters,
) {
  return (
    Boolean(filters.query) ||
    filters.sort !== DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT ||
    getPublicPhotographerExploreDialogFilterCount(filters) > 0
  );
}
