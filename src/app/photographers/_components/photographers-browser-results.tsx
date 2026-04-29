import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { ExplorePhotographerCard } from "@/components/explore-photographer-card";
import { Button } from "@/components/ui/button";

type PhotographerCardData = ComponentProps<
  typeof ExplorePhotographerCard
>["photographer"];

export function PhotographersBrowserResults({
  currentPage,
  hasActiveFilters,
  hasMore,
  isInteractionDisabled,
  isLoadingMore,
  onLoadMore,
  photographers,
  totalCount,
  visibleCount,
}: {
  currentPage: number;
  hasActiveFilters: boolean;
  hasMore: boolean;
  isInteractionDisabled: boolean;
  isLoadingMore: boolean;
  onLoadMore: (nextPage: number) => void;
  photographers: PhotographerCardData[];
  totalCount: number;
  visibleCount: number;
}) {
  if (photographers.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
        <h2 className="text-xl font-semibold text-slate-950">
          {hasActiveFilters
            ? "No photographers match these filters"
            : "No photographers are live yet"}
        </h2>
        <p className="mt-2 text-slate-600">
          {hasActiveFilters
            ? "Try a broader search, remove a few filters, or reset the current view."
            : "Approved photographer profiles will show up here as soon as they are published."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {photographers.map((photographer) => (
          <ExplorePhotographerCard
            key={photographer.id}
            photographer={photographer}
          />
        ))}
      </div>

      {hasMore ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-slate-500">
            Showing {visibleCount} of {totalCount} photographers
          </p>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-md border-slate-300 px-5"
            onClick={() => onLoadMore(currentPage + 1)}
            disabled={isInteractionDisabled}
          >
            {isLoadingMore ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load more photographers"
            )}
          </Button>
        </div>
      ) : totalCount > 12 ? (
        <p className="text-center text-sm text-slate-500">
          You&apos;ve reached the end of the list.
        </p>
      ) : null}
    </div>
  );
}
