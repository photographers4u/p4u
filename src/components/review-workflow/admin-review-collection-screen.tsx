import { headers } from "next/headers";

function normalizeSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [
      key,
      Array.isArray(value) ? value[0] : value,
    ]),
  ) as Record<string, string | undefined>;
}

export async function AdminReviewCollectionScreen<TParams, TData>({
  searchParams,
  parseSearchParams,
  fetchData,
  renderBrowser,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  parseSearchParams: (
    searchParams: Record<string, string | undefined>,
  ) => TParams;
  fetchData: (input: { params: TParams; requestHeaders: Headers }) => Promise<{
    status: number;
    data: TData | null;
    error: string | null;
  }>;
  renderBrowser: (input: {
    initialData: TData | null;
    initialError: string | null;
    initialParams: TParams;
    initialPage: number;
  }) => React.ReactNode;
}) {
  const resolvedSearchParams = normalizeSearchParams(await searchParams);
  const initialParams = parseSearchParams(resolvedSearchParams);
  const requestHeaders = await headers();
  const result = await fetchData({
    params: initialParams,
    requestHeaders,
  });
  const initialPage =
    typeof initialParams === "object" &&
    initialParams !== null &&
    "page" in initialParams &&
    typeof initialParams.page === "number"
      ? initialParams.page
      : 1;

  return renderBrowser({
    initialData: result.data,
    initialError: result.error,
    initialParams,
    initialPage,
  });
}
