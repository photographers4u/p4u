"use client";

import type { InferResponseType } from "hono/client";
import { useQueryStates } from "nuqs";
import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import {
  buildPublicPhotographerExploreApiQuery,
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT,
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
  getPublicPhotographerExploreDialogFilterCount,
  hasActivePublicPhotographerExploreFilters,
  normalizePublicPhotographerExploreFilters,
  normalizePublicPhotographerExplorePage,
  publicPhotographerExploreQueryStateParsers,
  type PublicPhotographerExploreFilters,
} from "@/lib/public-photographer-explore";
import type { SpecialityFilterOption } from "@/server/services/speciality";
import { PhotographersBrowserHero } from "./_components/photographers-browser-hero";
import { PhotographersBrowserResults } from "./_components/photographers-browser-results";
import { PhotographersBrowserToolbar } from "./_components/photographers-browser-toolbar";
import type { PhotographersBrowserDialogFilters } from "./_components/photographers-browser-types";

type PhotographersExploreResponse = InferResponseType<
  typeof apiClient.photographers.explore.$get,
  200
>;

function areFiltersEqual(
  left: PublicPhotographerExploreFilters,
  right: PublicPhotographerExploreFilters,
) {
  return (
    left.query === right.query &&
    left.sort === right.sort &&
    left.experience === right.experience &&
    left.location === right.location &&
    left.specialities.length === right.specialities.length &&
    left.specialities.every(
      (speciality, index) => speciality === right.specialities[index],
    )
  );
}

function createDialogFilters(
  filters: PublicPhotographerExploreFilters,
): PhotographersBrowserDialogFilters {
  return {
    experience: filters.experience,
    location: filters.location,
    specialities: [...filters.specialities],
  };
}

export function PhotographersBrowser({
  initialFilters,
  initialLoadedPageCount,
  initialPage,
  availableSpecialities,
}: {
  initialFilters: PublicPhotographerExploreFilters;
  initialLoadedPageCount: number;
  initialPage: PhotographersExploreResponse;
  availableSpecialities: SpecialityFilterOption[];
}) {
  const abortControllerRef = useRef<AbortController | null>(null);
  const committedStateRef = useRef({
    filters: initialFilters,
    page: initialLoadedPageCount,
  });
  const [urlState, setUrlState] = useQueryStates(
    publicPhotographerExploreQueryStateParsers,
  );
  const [photographers, setPhotographers] = useState(initialPage.photographers);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialLoadedPageCount);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [searchInput, setSearchInput] = useState(initialFilters.query);
  const [dialogFilters, setDialogFilters] = useState(
    createDialogFilters(initialFilters),
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(initialPage.totalCount);

  const specialityLabelMap = useMemo(
    () =>
      new Map(
        availableSpecialities.map((speciality) => [
          speciality.slug,
          speciality.name,
        ]),
      ),
    [availableSpecialities],
  );

  const urlFilters = useMemo(
    () =>
      normalizePublicPhotographerExploreFilters({
        experience: urlState.experience,
        location: urlState.location,
        query: urlState.q,
        sort: urlState.sort,
        specialities: urlState.speciality,
      }),
    [
      urlState.experience,
      urlState.location,
      urlState.q,
      urlState.sort,
      urlState.speciality,
    ],
  );
  const urlPage = normalizePublicPhotographerExplorePage(urlState.page);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    committedStateRef.current = {
      filters: appliedFilters,
      page: currentPage,
    };
  }, [appliedFilters, currentPage]);

  async function updateUrlState(
    nextFilters: PublicPhotographerExploreFilters,
    page = 1,
    history: "push" | "replace" = "push",
  ) {
    await setUrlState(
      {
        experience: nextFilters.experience,
        location: nextFilters.location,
        page,
        q: nextFilters.query,
        sort: nextFilters.sort,
        speciality: nextFilters.specialities,
      },
      {
        history,
        scroll: false,
      },
    );
  }

  async function requestExplorePage(
    filters: PublicPhotographerExploreFilters,
    page: number,
    signal: AbortSignal,
  ) {
    const response = await apiClient.photographers.explore.$get(
      {
        query: buildPublicPhotographerExploreApiQuery(filters, {
          page,
        }),
      },
      {
        init: { signal },
      },
    );

    const { errorMessage, payload } =
      await readApiResponse<PhotographersExploreResponse>(response);

    if (!response.ok || !payload) {
      throw new Error(errorMessage ?? "Couldn't refresh photographers.");
    }

    return payload;
  }

  async function restoreCommittedUrlState() {
    const { filters, page } = committedStateRef.current;

    await updateUrlState(filters, page, "replace");
  }

  async function fetchPhotographersPage(
    filters: PublicPhotographerExploreFilters,
    page: number,
    mode: "append" | "replace",
  ) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (mode === "append") {
      setIsLoadingMore(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const payload = await requestExplorePage(filters, page, controller.signal);

      startTransition(() => {
        setPhotographers((current) =>
          mode === "append"
            ? [...current, ...payload.photographers]
            : payload.photographers,
        );
        setCurrentPage(payload.page);
        setHasMore(payload.hasMore);
        setTotalCount(payload.totalCount);

        if (mode === "replace") {
          setAppliedFilters(filters);
          setSearchInput(filters.query);
          setDialogFilters(createDialogFilters(filters));
        }
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't refresh photographers.",
      );

      if (abortControllerRef.current === controller) {
        void restoreCommittedUrlState();
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }

      if (mode === "append") {
        setIsLoadingMore(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }

  async function fetchPhotographersUpToPage(
    filters: PublicPhotographerExploreFilters,
    targetPage: number,
  ) {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsRefreshing(true);

    try {
      const nextPage = Math.max(1, targetPage);
      let mergedPhotographers: PhotographersExploreResponse["photographers"] =
        [];
      let lastPayload: PhotographersExploreResponse | null = null;

      for (let page = 1; page <= nextPage; page += 1) {
        lastPayload = await requestExplorePage(filters, page, controller.signal);
        mergedPhotographers = [
          ...mergedPhotographers,
          ...lastPayload.photographers,
        ];
      }

      if (!lastPayload) {
        return;
      }

      startTransition(() => {
        setPhotographers(mergedPhotographers);
        setCurrentPage(lastPayload.page);
        setHasMore(lastPayload.hasMore);
        setTotalCount(lastPayload.totalCount);
        setAppliedFilters(filters);
        setSearchInput(filters.query);
        setDialogFilters(createDialogFilters(filters));
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't refresh photographers.",
      );

      if (abortControllerRef.current === controller) {
        void restoreCommittedUrlState();
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    const filtersChanged = !areFiltersEqual(appliedFilters, urlFilters);
    const pageChanged = currentPage !== urlPage;

    if (!filtersChanged && !pageChanged) {
      return;
    }

    if (!filtersChanged && pageChanged && urlPage === currentPage + 1) {
      void fetchPhotographersPage(urlFilters, urlPage, "append");
      return;
    }

    void fetchPhotographersUpToPage(urlFilters, urlPage);
  }, [appliedFilters, currentPage, urlFilters, urlPage]);

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void updateUrlState(
      {
        ...appliedFilters,
        query: searchInput.trim(),
      },
      1,
      "push",
    );
  }

  function handleDialogOpen() {
    setDialogFilters(createDialogFilters(appliedFilters));
  }

  function handleDialogApply() {
    void updateUrlState(
      {
        ...appliedFilters,
        query: searchInput.trim(),
        experience: dialogFilters.experience,
        location: dialogFilters.location,
        specialities: dialogFilters.specialities,
      },
      1,
      "push",
    );
  }

  function handleSortChange(value: PublicPhotographerExploreFilters["sort"]) {
    void updateUrlState(
      {
        ...appliedFilters,
        sort: value,
      },
      1,
      "push",
    );
  }

  function toggleSpeciality(specialitySlug: string) {
    setDialogFilters((current) => {
      const isSelected = current.specialities.includes(specialitySlug);

      return {
        ...current,
        specialities: isSelected
          ? current.specialities.filter((slug) => slug !== specialitySlug)
          : [...current.specialities, specialitySlug],
      };
    });
  }

  function resetAllFilters() {
    setSearchInput(DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS.query);
    setDialogFilters({
      experience: DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS.experience,
      location: DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS.location,
      specialities: [],
    });

    void updateUrlState(DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS, 1, "push");
  }

  function removeSpecialityFilter(specialitySlug: string) {
    void updateUrlState(
      {
        ...appliedFilters,
        specialities: appliedFilters.specialities.filter(
          (slug) => slug !== specialitySlug,
        ),
      },
      1,
      "push",
    );
  }

  const dialogFilterCount = getPublicPhotographerExploreDialogFilterCount({
    experience: appliedFilters.experience,
    location: appliedFilters.location,
    sort: DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS.sort,
    specialities: appliedFilters.specialities,
  });
  const activeFilterCount =
    Number(Boolean(appliedFilters.query)) +
    Number(appliedFilters.sort !== DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_SORT) +
    Number(Boolean(appliedFilters.experience)) +
    Number(Boolean(appliedFilters.location)) +
    appliedFilters.specialities.length;
  const hasActiveFilters =
    hasActivePublicPhotographerExploreFilters(appliedFilters);
  const isInteractionDisabled = isLoadingMore || isRefreshing;
  const visibleCount = photographers.length;

  return (
    <>
      <div className="space-y-6">
        <section className="space-y-2 border-b border-slate-200 pb-6">
          <PhotographersBrowserHero />

          <PhotographersBrowserToolbar
            appliedFilters={appliedFilters}
            availableSpecialities={availableSpecialities}
            activeFilterCount={activeFilterCount}
            dialogFilterCount={dialogFilterCount}
            dialogFilters={dialogFilters}
            hasActiveFilters={hasActiveFilters}
            isDialogOpen={isDialogOpen}
            isInteractionDisabled={isInteractionDisabled}
            isRefreshing={isRefreshing}
            onDialogApply={handleDialogApply}
            onDialogOpen={handleDialogOpen}
            onDialogOpenChange={setIsDialogOpen}
            onResetAllFilters={resetAllFilters}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onSortChange={handleSortChange}
            onToggleSpeciality={toggleSpeciality}
            searchInput={searchInput}
            setDialogFilters={setDialogFilters}
            specialityLabelMap={specialityLabelMap}
            totalCount={totalCount}
            visibleCount={visibleCount}
          />
        </section>
      </div>

      <PhotographersBrowserResults
        currentPage={currentPage}
        hasActiveFilters={hasActiveFilters}
        hasMore={hasMore}
        isInteractionDisabled={isInteractionDisabled}
        isLoadingMore={isLoadingMore}
        onLoadMore={(nextPage) => {
          void updateUrlState(appliedFilters, nextPage, "replace");
        }}
        photographers={photographers}
        totalCount={totalCount}
        visibleCount={visibleCount}
      />
    </>
  );
}
