import {
  getSearchParamFirstValue,
  type SearchParamsRecord,
} from "@/lib/search-params";

export const DASHBOARD_OVERVIEW_RANGES = ["1m", "3m", "6m", "1y"] as const;

export type DashboardOverviewRange =
  (typeof DASHBOARD_OVERVIEW_RANGES)[number];

export const DEFAULT_DASHBOARD_OVERVIEW_RANGE: DashboardOverviewRange = "1m";

const rangeSet = new Set<string>(DASHBOARD_OVERVIEW_RANGES);

function isDashboardOverviewRange(
  value: string | undefined,
): value is DashboardOverviewRange {
  return typeof value === "string" && rangeSet.has(value);
}

export function getDashboardOverviewRangeFilters(
  params: SearchParamsRecord,
): {
  range: DashboardOverviewRange;
} {
  const range = getSearchParamFirstValue(params.range);

  return {
    range: isDashboardOverviewRange(range)
      ? range
      : DEFAULT_DASHBOARD_OVERVIEW_RANGE,
  };
}

export function getDashboardOverviewRangeLabel(range: DashboardOverviewRange) {
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

export function buildDashboardOverviewHref(range: DashboardOverviewRange) {
  return range === DEFAULT_DASHBOARD_OVERVIEW_RANGE
    ? "/dashboard/overview"
    : `/dashboard/overview?range=${range}`;
}
