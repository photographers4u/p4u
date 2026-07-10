"use client";

import type { InferResponseType } from "hono/client";
import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { ExplorePhotographerCard } from "@/components/explore-photographer-card";
import { Button } from "@/components/ui/button";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import {
  buildPublicPhotographerExploreApiQuery,
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
} from "@/lib/public-photographer-explore";

type PhotographersExploreResponse = InferResponseType<
  typeof apiClient.photographers.explore.$get,
  200
>;

const BrowsePhotographers = ({
  initialPage,
}: {
  initialPage: PhotographersExploreResponse;
}) => {
  const [photographers, setPhotographers] = useState(initialPage.photographers);
  const [currentPage, setCurrentPage] = useState(initialPage.page);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadMore() {
    setIsLoadingMore(true);

    try {
      const response = await apiClient.photographers.explore.$get({
        query: buildPublicPhotographerExploreApiQuery(
          DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
          { page: currentPage + 1 },
        ),
      });
      const { errorMessage, payload } =
        await readApiResponse<PhotographersExploreResponse>(response);

      if (!response.ok || !payload) {
        throw new Error(errorMessage ?? "Couldn't load more photographers.");
      }

      setPhotographers((current) => [...current, ...payload.photographers]);
      setCurrentPage(payload.page);
      setHasMore(payload.hasMore);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't load more photographers.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: () => void loadMore(),
  });

  if (photographers.length === 0) {
    return (
      <div className="px-6 text-center text-sm text-muted-foreground">
        Photographers will appear here soon.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {photographers.map((elem, index) => (
          <ExplorePhotographerCard
            key={elem.id}
            photographer={elem}
            imageMode="cover"
            priority={index < 4}
          />
        ))}
      </div>

      {hasMore ? (
        <div ref={sentinelRef} className="mt-6 flex justify-center">
          {isLoadingMore ? (
            <LoaderCircle className="size-5 animate-spin text-slate-400" />
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 flex justify-center max-md:hidden">
        <Button
          asChild
          variant="outline"
          className="h-10 rounded-md px-6 text-sm"
        >
          <Link href="/photographers">Browse all photographers</Link>
        </Button>
      </div>
    </div>
  );
};

export default BrowsePhotographers;
