export type SearchParamValue = string | string[] | undefined;
export type SearchParamsRecord = Record<string, SearchParamValue>;

export function getSearchParamFirstValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value;
}

export function getSearchParamValues(value: SearchParamValue) {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    return [value];
  }

  return [];
}

export function getTrimmedSearchParamValue(
  value: SearchParamValue,
  fallback = "",
) {
  return getSearchParamFirstValue(value)?.trim() ?? fallback;
}

export function parsePositiveIntSearchParam(
  value: SearchParamValue,
  fallback = 1,
) {
  const parsedValue = Number.parseInt(
    getSearchParamFirstValue(value) ?? "",
    10,
  );

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return parsedValue;
}

export function matchesSearchParamFlag(
  value: SearchParamValue,
  enabledValue = "1",
) {
  return getSearchParamFirstValue(value) === enabledValue;
}
