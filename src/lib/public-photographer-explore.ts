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

type RawSearchParamValue = string | string[] | undefined;
type RawSearchParams = Record<string, RawSearchParamValue>;

const DEFAULT_QUERY = "";
const DEFAULT_SPECIALITIES: string[] = [];
const sortSet = new Set<string>(PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS);
const experienceSet = new Set<string>(EXPERIENCE_YEARS);
const locationSet = new Set<string>(CITIES);
const MAX_SPECIALITY_FILTERS = 12;
export const PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE = 12;

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

function getFirstValue(value: RawSearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value: RawSearchParamValue) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

function normalizeQuery(value: string | undefined) {
  return value?.trim().slice(0, NAME_MAX_LENGTH) ?? DEFAULT_QUERY;
}

function normalizePage(value: string | undefined) {
  const parsedPage = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
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

function normalizeSpecialities(values: RawSearchParamValue) {
  const seen = new Set<string>();

  return toArray(values)
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
  params: RawSearchParams,
): PublicPhotographerExploreFilters {
  const query = normalizeQuery(getFirstValue(params.q));
  const sort = getFirstValue(params.sort);
  const experience = getFirstValue(params.experience);
  const location = getFirstValue(params.location);

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
  params: RawSearchParams,
) {
  return normalizePage(getFirstValue(params.page));
}

export function getPublicPhotographerExploreFiltersFromSearchParams(
  searchParams: URLSearchParams,
): PublicPhotographerExploreFilters {
  return getPublicPhotographerExploreFilters({
    experience: searchParams.get("experience") ?? undefined,
    location: searchParams.get("location") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? undefined,
    speciality: searchParams.getAll("speciality"),
  });
}

export function getPublicPhotographerExplorePageFromSearchParams(
  searchParams: URLSearchParams,
) {
  return normalizePage(searchParams.get("page") ?? undefined);
}

export function buildPublicPhotographerExploreSearchParams(
  filters: PublicPhotographerExploreFilters,
  options?: {
    page?: number;
  },
) {
  const searchParams = new URLSearchParams();

  if (filters.query) {
    searchParams.set("q", filters.query);
  }

  if (filters.sort !== DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT) {
    searchParams.set("sort", filters.sort);
  }

  if (filters.experience) {
    searchParams.set("experience", filters.experience);
  }

  if (filters.location) {
    searchParams.set("location", filters.location);
  }

  for (const speciality of filters.specialities) {
    searchParams.append("speciality", speciality);
  }

  if (options?.page && options.page > 1) {
    searchParams.set("page", String(options.page));
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
