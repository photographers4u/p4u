"use client";

import type { InferResponseType } from "hono/client";
import { ArrowUpDown, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { startTransition, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BrowserFilterDialog } from "@/components/browser/filter-dialog";
import { ExplorePhotographerCard } from "@/components/explore-photographer-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { formatPhotographerExperience } from "@/lib/photographer-presentation";
import {
  buildPublicPhotographerExploreApiQuery,
  buildPublicPhotographerExploreSearchParams,
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
  getPublicPhotographerExploreDialogFilterCount,
  getPublicPhotographerExploreSortLabel,
  hasActivePublicPhotographerExploreFilters,
  PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS,
  type PublicPhotographerExploreFilters,
} from "@/lib/public-photographer-explore";
import type { SpecialityFilterOption } from "@/server/services/speciality";
import { CITIES, EXPERIENCE_YEARS } from "@/zod/helpers";

const ALL_FILTER_VALUE = "__all__";

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
  const pathname = usePathname();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [photographers, setPhotographers] = useState(initialPage.photographers);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [currentPage, setCurrentPage] = useState(initialLoadedPageCount);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [searchInput, setSearchInput] = useState(initialFilters.query);
  const [dialogFilters, setDialogFilters] = useState({
    sort: initialFilters.sort,
    experience: initialFilters.experience,
    location: initialFilters.location,
    specialities: [...initialFilters.specialities],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(initialPage.totalCount);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  function syncBrowserUrl(filters: PublicPhotographerExploreFilters, page = 1) {
    const searchParams = buildPublicPhotographerExploreSearchParams(filters, {
      page,
    });
    const queryString = searchParams.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    window.history.replaceState(null, "", nextUrl);
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
      const response = await apiClient.photographers.explore.$get(
        {
          query: buildPublicPhotographerExploreApiQuery(filters, { page }),
        },
        {
          init: { signal: controller.signal },
        },
      );
      const { errorMessage, payload } =
        await readApiResponse<PhotographersExploreResponse>(response);

      if (!response.ok || !payload) {
        toast.error(errorMessage ?? "Couldn't refresh photographers.");
        return;
      }

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
          setDialogFilters({
            sort: filters.sort,
            experience: filters.experience,
            location: filters.location,
            specialities: [...filters.specialities],
          });
        }
      });

      if (mode === "replace") {
        syncBrowserUrl(filters, 1);
      } else {
        syncBrowserUrl(filters, payload.page);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      toast.error("Couldn't refresh photographers.");
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

  async function applyFilters(nextFilters: PublicPhotographerExploreFilters) {
    if (areFiltersEqual(appliedFilters, nextFilters)) {
      syncBrowserUrl(nextFilters, currentPage);
      return;
    }

    await fetchPhotographersPage(nextFilters, 1, "replace");
  }

  async function loadMorePhotographers() {
    if (!hasMore) return;
    await fetchPhotographersPage(appliedFilters, currentPage + 1, "append");
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void applyFilters({
      ...appliedFilters,
      query: searchInput.trim(),
    });
  }

  function handleDialogOpen() {
    setDialogFilters({
      sort: appliedFilters.sort,
      experience: appliedFilters.experience,
      location: appliedFilters.location,
      specialities: [...appliedFilters.specialities],
    });
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
    const nextFilters = {
      ...DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
      specialities: [],
    };

    setSearchInput(nextFilters.query);
    setDialogFilters({
      sort: nextFilters.sort,
      experience: null,
      location: null,
      specialities: [],
    });
    void applyFilters(nextFilters);
  }

  const dialogFilterCount =
    getPublicPhotographerExploreDialogFilterCount(appliedFilters);
  const hasActiveFilters =
    hasActivePublicPhotographerExploreFilters(appliedFilters);
  const isInteractionDisabled = isLoadingMore || isRefreshing;
  const visibleCount = photographers.length;

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="rounded-[2rem] border bg-white/85 p-4 shadow-[0_20px_45px_-38px_rgba(15,23,42,0.55)] backdrop-blur">
          {/* Single row: search + filters + reset */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by photographer name"
                className="h-12 rounded-[1.35rem] border-slate-200 bg-slate-50/80 pl-11 text-sm shadow-none"
                disabled={isInteractionDisabled}
              />
            </div>

            <Button
              type="submit"
              className="h-12 rounded-[1.35rem] px-5"
              disabled={isInteractionDisabled}
            >
              Search
            </Button>

            <div className="flex items-center gap-2">
              <BrowserFilterDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onOpen={handleDialogOpen}
                onApply={() => {
                  void applyFilters({
                    ...appliedFilters,
                    query: searchInput.trim(),
                    sort: dialogFilters.sort,
                    experience: dialogFilters.experience,
                    location: dialogFilters.location,
                    specialities: dialogFilters.specialities,
                  });
                }}
                activeCount={dialogFilterCount}
                title="Filter photographers"
                triggerLabel="Filters"
              >
                <div className="space-y-5">
                  {/* Sort — moved inside dialog */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Sort by
                    </p>
                    <Select
                      value={dialogFilters.sort}
                      onValueChange={(value) => {
                        setDialogFilters((current) => ({
                          ...current,
                          sort: value as PublicPhotographerExploreFilters["sort"],
                        }));
                      }}
                    >
                      <SelectTrigger className="h-11 w-full">
                        <ArrowUpDown className="size-4 text-slate-500" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS.map((sort) => (
                          <SelectItem key={sort} value={sort}>
                            {getPublicPhotographerExploreSortLabel(sort)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Experience
                      </p>
                      <Select
                        value={dialogFilters.experience ?? ALL_FILTER_VALUE}
                        onValueChange={(value) => {
                          setDialogFilters((current) => ({
                            ...current,
                            experience:
                              value === ALL_FILTER_VALUE
                                ? null
                                : (value as (typeof EXPERIENCE_YEARS)[number]),
                          }));
                        }}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER_VALUE}>
                            Any experience
                          </SelectItem>
                          {EXPERIENCE_YEARS.map((year) => (
                            <SelectItem key={year} value={year}>
                              {formatPhotographerExperience(year)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Location
                      </p>
                      <Select
                        value={dialogFilters.location ?? ALL_FILTER_VALUE}
                        onValueChange={(value) => {
                          setDialogFilters((current) => ({
                            ...current,
                            location:
                              value === ALL_FILTER_VALUE
                                ? null
                                : (value as (typeof CITIES)[number]),
                          }));
                        }}
                      >
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER_VALUE}>
                            Any location
                          </SelectItem>
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city}>
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Specialities
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDialogFilters((current) => ({
                            ...current,
                            sort: DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS.sort,
                            experience: null,
                            location: null,
                            specialities: [],
                          }));
                        }}
                        className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
                      >
                        Clear dialog filters
                      </button>
                    </div>

                    <div className="max-h-56 overflow-y-auto rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-3">
                      <div className="flex flex-wrap gap-2">
                        {availableSpecialities.map((speciality) => {
                          const isSelected =
                            dialogFilters.specialities.includes(
                              speciality.slug,
                            );

                          return (
                            <Button
                              key={speciality.slug}
                              type="button"
                              variant={isSelected ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleSpeciality(speciality.slug)}
                              className="h-8 rounded-full"
                            >
                              {speciality.name}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </BrowserFilterDialog>

              {/* Reset button — inline after Filters */}
              {hasActiveFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={resetAllFilters}
                  disabled={isInteractionDisabled}
                >
                  <RotateCcw className="size-3.5" />
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      </div>

      {photographers.length === 0 ? (
        <div className="rounded-2xl px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold text-slate-950">
            {hasActiveFilters
              ? "No photographers match these filters"
              : "No photographers are live yet"}
          </h2>
          <p className="mt-2 text-slate-600">
            {hasActiveFilters
              ? "Try a broader name search, a different sort order, or reset the filters."
              : "Approved photographer profiles will show up here as soon as they are published."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                className="h-11 rounded-full border-slate-300 px-6"
                onClick={() => void loadMorePhotographers()}
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
      )}
    </>
  );
}
