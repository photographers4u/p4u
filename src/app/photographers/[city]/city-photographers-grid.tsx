"use client";

import type { InferResponseType } from "hono/client";
import { useState } from "react";
import { toast } from "sonner";
import { PhotographersBrowserResults } from "@/app/photographers/_components/photographers-browser-results";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import type { CityName } from "@/lib/city-pages";
import {
  buildPublicPhotographerExploreApiQuery,
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
} from "@/lib/public-photographer-explore";

type PhotographersExploreResponse = InferResponseType<
  typeof apiClient.photographers.explore.$get,
  200
>;

export function CityPhotographersGrid({
  city,
  initialPage,
}: {
  city: CityName;
  initialPage: PhotographersExploreResponse;
}) {
  const [photographers, setPhotographers] = useState(initialPage.photographers);
  const [currentPage, setCurrentPage] = useState(initialPage.page);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [totalCount] = useState(initialPage.totalCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  async function loadMore(nextPage: number) {
    setIsLoadingMore(true);

    try {
      const response = await apiClient.photographers.explore.$get({
        query: buildPublicPhotographerExploreApiQuery(
          { ...DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS, location: city },
          { page: nextPage },
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

  return (
    <PhotographersBrowserResults
      currentPage={currentPage}
      hasActiveFilters={false}
      hasMore={hasMore}
      isInteractionDisabled={isLoadingMore}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
      photographers={photographers}
      totalCount={totalCount}
      visibleCount={photographers.length}
    />
  );
}
