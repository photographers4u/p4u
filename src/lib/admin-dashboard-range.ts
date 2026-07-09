import {
  getSearchParamFirstValue,
  type SearchParamsRecord,
} from "@/lib/search-params";

export const ADMIN_DASHBOARD_RANGES = ["1m", "3m", "6m", "1y"] as const;

export type AdminDashboardRange = (typeof ADMIN_DASHBOARD_RANGES)[number];

export const DEFAULT_ADMIN_DASHBOARD_RANGE: AdminDashboardRange = "1m";

const rangeSet = new Set<string>(ADMIN_DASHBOARD_RANGES);

function isAdminDashboardRange(
  value: string | undefined,
): value is AdminDashboardRange {
  return typeof value === "string" && rangeSet.has(value);
}

export function getAdminDashboardRangeFilters(params: SearchParamsRecord): {
  range: AdminDashboardRange;
} {
  const range = getSearchParamFirstValue(params.range);

  return {
    range: isAdminDashboardRange(range) ? range : DEFAULT_ADMIN_DASHBOARD_RANGE,
  };
}

export function getAdminDashboardRangeLabel(range: AdminDashboardRange) {
  switch (range) {
    case "3m":
      return "3 Months";
    case "6m":
      return "6 Months";
    case "1y":
      return "This Year";
    default:
      return "1 Month";
  }
}

export function buildAdminDashboardHref(range: AdminDashboardRange) {
  return range === DEFAULT_ADMIN_DASHBOARD_RANGE
    ? "/admin"
    : `/admin?range=${range}`;
}
