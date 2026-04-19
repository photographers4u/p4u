import {
  getSearchParamFirstValue,
  getTrimmedSearchParamValue,
  parsePositiveIntSearchParam,
  type SearchParamsRecord,
  type SearchParamValue,
} from "@/lib/search-params";
import {
  type AdminPhotographerListFilters,
  type AdminPhotographerListSort,
  type AdminPhotographerListStatusFilter,
  adminPhotographerListFiltersSchema,
  adminPhotographerListSortValues,
  adminPhotographerListStatusFilterValues,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
  DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
} from "@/zod/schema/photographer";

const sortSet = new Set<string>(adminPhotographerListSortValues);
const statusSet = new Set<string>(adminPhotographerListStatusFilterValues);

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

export function getAdminPhotographerListFilters(
  params: SearchParamsRecord,
): AdminPhotographerListFilters {
  const sort = getSearchParamFirstValue(params.sort);
  const status = getSearchParamFirstValue(params.status);

  return adminPhotographerListFiltersSchema.parse({
    page: parsePositiveIntSearchParam(params.page),
    query: getTrimmedSearchParamValue(params.q),
    sort: isAdminPhotographerListSort(sort)
      ? sort
      : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_SORT,
    status: isAdminPhotographerListStatusFilter(status)
      ? status
      : DEFAULT_ADMIN_PHOTOGRAPHER_LIST_STATUS,
  });
}

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
