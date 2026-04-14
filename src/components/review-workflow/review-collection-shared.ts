export const reviewFilters = [
  "all",
  "pending",
  "approved",
  "rejected",
  "on_hold",
] as const;

export const reviewFilterLabels = {
  all: "All statuses",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  on_hold: "On hold",
} as const;

export const reviewSortByOptions = ["createdAt", "reviewedAt"] as const;

export const reviewSortByLabels = {
  createdAt: "Created date",
  reviewedAt: "Reviewed date",
} as const;

export const reviewSortOrderOptions = ["desc", "asc"] as const;

export const reviewSortOrderLabels = {
  desc: "Newest first",
  asc: "Oldest first",
} as const;

export type ReviewFilter = (typeof reviewFilters)[number];
export type ReviewSortBy = (typeof reviewSortByOptions)[number];
export type ReviewSortOrder = (typeof reviewSortOrderOptions)[number];

export type ReviewCollectionParams<TCategory extends string> = {
  status: ReviewFilter;
  category: "all" | TCategory;
  sortBy: ReviewSortBy;
  sortOrder: ReviewSortOrder;
  page: number;
};

function normalizeValue(value: string | string[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function createReviewCollectionConfig<
  TCategory extends string,
  TRequest,
>({
  basePath,
  pageSize,
  categoryOptions,
  buildRequest,
}: {
  basePath: string;
  pageSize: number;
  categoryOptions: readonly TCategory[];
  buildRequest: (
    params: ReviewCollectionParams<TCategory>,
    pageSize: number,
  ) => TRequest;
}) {
  const reviewCategoryOptions = ["all", ...categoryOptions] as const;

  function getReviewPage(value: string | string[] | null | undefined) {
    const parsed = Number(normalizeValue(value));

    if (!Number.isFinite(parsed) || parsed < 1) {
      return 1;
    }

    return Math.floor(parsed);
  }

  function getReviewFilter(
    value: string | string[] | null | undefined,
  ): ReviewFilter {
    const normalized = normalizeValue(value);

    return reviewFilters.includes(normalized as ReviewFilter)
      ? (normalized as ReviewFilter)
      : "all";
  }

  function getReviewSortBy(
    value: string | string[] | null | undefined,
  ): ReviewSortBy {
    const normalized = normalizeValue(value);

    return reviewSortByOptions.includes(normalized as ReviewSortBy)
      ? (normalized as ReviewSortBy)
      : "createdAt";
  }

  function getReviewSortOrder(
    value: string | string[] | null | undefined,
  ): ReviewSortOrder {
    const normalized = normalizeValue(value);

    return reviewSortOrderOptions.includes(normalized as ReviewSortOrder)
      ? (normalized as ReviewSortOrder)
      : "desc";
  }

  function getReviewCategory(
    value: string | string[] | null | undefined,
  ): "all" | TCategory {
    const normalized = normalizeValue(value);

    return reviewCategoryOptions.includes(normalized as "all" | TCategory)
      ? (normalized as "all" | TCategory)
      : "all";
  }

  function buildReviewHref(params: ReviewCollectionParams<TCategory>) {
    const query = new URLSearchParams();

    if (params.status !== "all") {
      query.set("status", params.status);
    }

    if (params.category !== "all") {
      query.set("category", params.category);
    }

    if (params.sortBy !== "createdAt") {
      query.set("sortBy", params.sortBy);
    }

    if (params.sortOrder !== "desc") {
      query.set("sortOrder", params.sortOrder);
    }

    if (params.page !== 1) {
      query.set("page", String(params.page));
    }

    const queryString = query.toString();

    return queryString ? `${basePath}?${queryString}` : basePath;
  }

  function buildReviewListRequest(params: ReviewCollectionParams<TCategory>) {
    return buildRequest(params, pageSize);
  }

  return {
    pageSize,
    reviewCategoryOptions,
    getReviewPage,
    getReviewFilter,
    getReviewSortBy,
    getReviewSortOrder,
    getReviewCategory,
    buildReviewHref,
    buildReviewListRequest,
  };
}
