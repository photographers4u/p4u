import {
  getSearchParamFirstValue,
  getTrimmedSearchParamValue,
  matchesSearchParamFlag,
  parsePositiveIntSearchParam,
  type SearchParamsRecord,
  type SearchParamValue,
} from "@/lib/search-params";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import {
  type AdminPhotographerListCityFilter,
  type AdminPhotographerListFilters,
  type AdminPhotographerListOnboardingStepFilter,
  type AdminPhotographerListSort,
  type AdminPhotographerListStatusFilter,
  adminPhotographerListCityFilterValues,
  adminPhotographerListFiltersSchema,
  adminPhotographerListSortValues,
  adminPhotographerListStatusFilterValues,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_CITY,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_ONBOARDING_STEP,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  PHOTOGRAPHER_STALE_THRESHOLD_DAYS,
} from "@/zod/schema/photographer";

const sortSet = new Set<string>(adminPhotographerListSortValues);
const statusSet = new Set<string>(adminPhotographerListStatusFilterValues);
const citySet = new Set<string>(adminPhotographerListCityFilterValues);
const onboardingStepSet = new Set<number>(ONBOARDING_STEPS);

function isAdminPhotographerListSort(
  value: string | undefined,
): value is AdminPhotographerListSort {
  return typeof value === "string" && sortSet.has(value);
}

function isAdminPhotographerListStatusFilter(
  value: string | undefined,
): value is AdminPhotographerListStatusFilter {
  return typeof value === "string" && statusSet.has(value);
}

function isAdminPhotographerListCityFilter(
  value: string | undefined,
): value is AdminPhotographerListCityFilter {
  return typeof value === "string" && citySet.has(value);
}

function parseOnboardingStepFilter(
  value: string | undefined,
): AdminPhotographerListOnboardingStepFilter {
  const parsed = Number.parseInt(value ?? "", 10);

  return onboardingStepSet.has(parsed)
    ? (parsed as AdminPhotographerListOnboardingStepFilter)
    : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_ONBOARDING_STEP;
}

function parseDateFilterValue(value: string | undefined) {
  if (!value || Number.isNaN(Date.parse(value))) {
    return undefined;
  }

  return value;
}

export function getAdminPhotographerListFilters(
  params: SearchParamsRecord,
): AdminPhotographerListFilters {
  const sort = getSearchParamFirstValue(params.sort);
  const status = getSearchParamFirstValue(params.status);
  const city = getSearchParamFirstValue(params.city);
  const stage = getSearchParamFirstValue(params.stage);

  return adminPhotographerListFiltersSchema.parse({
    page: parsePositiveIntSearchParam(params.page),
    query: getTrimmedSearchParamValue(params.q),
    sort: isAdminPhotographerListSort(sort)
      ? sort
      : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
    status: isAdminPhotographerListStatusFilter(status)
      ? status
      : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
    city: isAdminPhotographerListCityFilter(city)
      ? city
      : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_CITY,
    onboardingStep: parseOnboardingStepFilter(stage),
    createdFrom: parseDateFilterValue(getSearchParamFirstValue(params.from)),
    createdTo: parseDateFilterValue(getSearchParamFirstValue(params.to)),
    stale: matchesSearchParamFlag(params.stale),
  });
}

export function getAdminPhotographerStageFilterLabel(
  stage: AdminPhotographerListOnboardingStepFilter,
) {
  return stage === "all" ? "All stages" : `Step ${stage} of ${ONBOARDING_STEPS.length}`;
}

export const ADMIN_PHOTOGRAPHER_STALE_THRESHOLD_DAYS =
  PHOTOGRAPHER_STALE_THRESHOLD_DAYS;

export function getAdminPhotographerStatusFilterLabel(
  status: AdminPhotographerListStatusFilter,
) {
  switch (status) {
    case "draft":
      return "Drafts";
    case "submitted":
      return "Submitted";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "on_hold":
      return "On hold";
    case "pending_verification":
      return "Pending Verification";
    default:
      return "All statuses";
  }
}

export function getAdminPhotographerSortLabel(sort: AdminPhotographerListSort) {
  switch (sort) {
    case "updated_desc":
      return "Recently updated";
    case "updated_asc":
      return "Oldest updates";
    case "created_desc":
      return "Newest first";
    case "created_asc":
      return "Oldest first";
    case "name_asc":
      return "Name A-Z";
    case "name_desc":
      return "Name Z-A";
    default:
      return "Review queue";
  }
}

export function buildAdminPhotographersHref(
  filters: AdminPhotographerListFilters,
  overrides: Partial<AdminPhotographerListFilters> = {},
) {
  const nextFilters = {
    ...filters,
    ...overrides,
  };
  const searchParams = new URLSearchParams();

  if (nextFilters.query) {
    searchParams.set("q", nextFilters.query);
  }

  if (nextFilters.status !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS) {
    searchParams.set("status", nextFilters.status);
  }

  if (nextFilters.sort !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT) {
    searchParams.set("sort", nextFilters.sort);
  }

  if (nextFilters.city !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_CITY) {
    searchParams.set("city", nextFilters.city);
  }

  if (nextFilters.onboardingStep !== DEFAULT_ADMIN_PHOTOGRAPHER_LIST_ONBOARDING_STEP) {
    searchParams.set("stage", String(nextFilters.onboardingStep));
  }

  if (nextFilters.createdFrom) {
    searchParams.set("from", nextFilters.createdFrom);
  }

  if (nextFilters.createdTo) {
    searchParams.set("to", nextFilters.createdTo);
  }

  if (nextFilters.stale) {
    searchParams.set("stale", "1");
  }

  if (nextFilters.page > 1) {
    searchParams.set("page", String(nextFilters.page));
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/admin/photographers?${queryString}`
    : "/admin/photographers";
}

export function getAdminPhotographersReturnToPath(value: SearchParamValue) {
  const returnTo = getSearchParamFirstValue(value);

  if (returnTo?.startsWith("/admin/photographers")) {
    return returnTo;
  }

  return "/admin/photographers";
}
