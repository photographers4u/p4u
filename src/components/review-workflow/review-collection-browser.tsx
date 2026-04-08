"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { startTransition, useState } from "react";
import { EmptyState } from "@/components/browser/empty-state";
import { BrowserPagination } from "@/components/browser/pagination-controls";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginatedResponse<TItem> = {
  items: TItem[];
  page: number;
  total: number;
  totalPages: number;
};

export function ReviewCollectionBrowser<
  TItem,
  TStatus extends string,
  TCategory extends string,
  TSortBy extends string,
  TSortOrder extends string,
  TResponse extends PaginatedResponse<TItem>,
>({
  title,
  itemLabelSingular: _itemLabelSingular,
  initialData,
  initialError,
  initialParams,
  buildHref,
  fetchPage,
  getDescription,
  getEmptyState,
  statusOptions,
  statusLabels,
  categoryOptions,
  categoryLabels,
  sortByOptions,
  sortByLabels,
  sortOrderOptions,
  sortOrderLabels,

  renderCard,
  getItemKey,
}: {
  title: string;
  pageSize: number;
  itemLabelSingular: string;
  itemLabelPlural: string;
  initialData: TResponse | null;
  initialError: string | null;
  initialParams: {
    status: TStatus;
    category: TCategory;
    sortBy: TSortBy;
    sortOrder: TSortOrder;
    page: number;
  };
  parseSearchParams?: (searchParams: URLSearchParams) => {
    status: TStatus;
    category: TCategory;
    sortBy: TSortBy;
    sortOrder: TSortOrder;
    page: number;
  };
  buildHref: (params: {
    status: TStatus;
    category: TCategory;
    sortBy: TSortBy;
    sortOrder: TSortOrder;
    page: number;
  }) => string;
  fetchPage: (params: {
    status: TStatus;
    category: TCategory;
    sortBy: TSortBy;
    sortOrder: TSortOrder;
    page: number;
  }) => Promise<
    | {
        kind: "success";
        data: TResponse;
      }
    | {
        kind: "error";
        status: number;
        error: string;
      }
  >;
  getDescription: (params: { status: TStatus; category: TCategory }) => string;
  getEmptyState: (params: { status: TStatus }) => {
    title: string;
    description: string;
  };
  statusOptions: readonly TStatus[];
  statusLabels: Record<TStatus, string>;
  categoryOptions: readonly TCategory[];
  categoryLabels: Record<TCategory, string>;
  sortByOptions: readonly TSortBy[];
  sortByLabels: Record<TSortBy, string>;
  sortOrderOptions: readonly TSortOrder[];
  sortOrderLabels: Record<TSortOrder, string>;
  sortOrderIcons?: Partial<Record<TSortOrder, ReactNode>>;

  renderCard: (item: TItem) => ReactNode;
  getItemKey: (item: TItem) => string;
}) {
  const router = useRouter();
  const [params, setParams] = useState(initialParams);
  const [data, setData] = useState(initialData);
  const [error, setError] = useState(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const items = data?.items ?? [];
  const totalItems = data?.total ?? items.length;
  const totalPages = data?.totalPages ?? 1;

  async function loadPage(nextParams: typeof initialParams) {
    setParams(nextParams);
    setIsLoading(true);
    setError(null);

    startTransition(() => {
      router.replace(buildHref(nextParams));
    });

    const result = await fetchPage(nextParams);

    if (result.kind === "success") {
      setData(result.data);
      setError(null);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }

  function updateFilters(
    updater: (current: typeof initialParams) => typeof initialParams,
  ) {
    void loadPage(updater(params));
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {getDescription({
            status: params.status,
            category: params.category,
          })}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pb-4 pt-1.5">
        {/* Status tabs */}
        <div className="flex gap-1">
          {statusOptions.map((s) => (
            <Button
              key={s}
              type="button"
              variant={params.status === s ? "default" : "outline"}
              onClick={() =>
                updateFilters((cur) => ({ ...cur, status: s, page: 1 }))
              }
              className="capitalize"
            >
              {statusLabels[s]}
              {params.status === s ? ` · ${totalItems}` : ""}
            </Button>
          ))}
        </div>

        <div className="hidden md:inline h-4 w-px bg-border mx-1" />

        {/* Category */}
        <Select
          value={params.category}
          onValueChange={(v) =>
            updateFilters((cur) => ({
              ...cur,
              category: v as TCategory,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {categoryLabels[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort by */}
        <Select
          value={params.sortBy}
          onValueChange={(v) =>
            updateFilters((cur) => ({ ...cur, sortBy: v as TSortBy, page: 1 }))
          }
        >
          <SelectTrigger className="w-36 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortByOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {sortByLabels[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort order */}
        <Select
          value={params.sortOrder}
          onValueChange={(v) =>
            updateFilters((cur) => ({
              ...cur,
              sortOrder: v as TSortOrder,
              page: 1,
            }))
          }
        >
          <SelectTrigger className="w-32 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOrderOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {sortOrderLabels[opt]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "a",
            "b",
            "c",
            "d",
            "e",
            "f",
            "g",
            "h",
            "i",
            "j",
            "k",
            "l",
            "m",
            "n",
            "o",
            "p",
          ].map((id) => (
            <div
              key={id}
              className="rounded-xl bg-muted animate-pulse aspect-4/3"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState {...getEmptyState({ status: params.status })} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={getItemKey(item)}>{renderCard(item)}</div>
          ))}
        </div>
      )}

      <BrowserPagination
        currentPage={data?.page ?? params.page}
        totalPages={totalPages}
        onPageChange={(page) =>
          updateFilters((current) => ({
            ...current,
            page,
          }))
        }
      />
    </div>
  );
}
