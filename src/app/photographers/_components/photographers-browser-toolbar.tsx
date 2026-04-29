import type { FormEventHandler } from "react";
import { ArrowUpDown, LoaderCircle, RotateCcw, Search } from "lucide-react";
import { BrowserFilterDialog } from "@/components/browser/filter-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
  getPublicPhotographerExploreSortLabel,
  PUBLIC_PHOTOGRAPHER_EXPLORE_SORTS,
  type PublicPhotographerExploreFilters,
} from "@/lib/public-photographer-explore";
import type { SpecialityFilterOption } from "@/server/services/speciality";
import { PhotographersBrowserFilterDialogContent } from "./photographers-browser-filter-dialog-content";
import type {
  PhotographersBrowserDialogFilters,
  SetPhotographersBrowserDialogFilters,
} from "./photographers-browser-types";

export function PhotographersBrowserToolbar({
  appliedFilters,
  availableSpecialities,
  activeFilterCount,
  dialogFilterCount,
  dialogFilters,
  hasActiveFilters,
  isDialogOpen,
  isInteractionDisabled,
  isRefreshing,
  onDialogApply,
  onDialogOpen,
  onDialogOpenChange,
  onResetAllFilters,
  onSearchInputChange,
  onSearchSubmit,
  onSortChange,
  onToggleSpeciality,
  searchInput,
  setDialogFilters,
  specialityLabelMap,
  totalCount,
  visibleCount,
}: {
  appliedFilters: PublicPhotographerExploreFilters;
  availableSpecialities: SpecialityFilterOption[];
  activeFilterCount: number;
  dialogFilterCount: number;
  dialogFilters: PhotographersBrowserDialogFilters;
  hasActiveFilters: boolean;
  isDialogOpen: boolean;
  isInteractionDisabled: boolean;
  isRefreshing: boolean;
  onDialogApply: () => void;
  onDialogOpen: () => void;
  onDialogOpenChange: (open: boolean) => void;
  onResetAllFilters: () => void;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: FormEventHandler<HTMLFormElement>;
  onSortChange: (value: PublicPhotographerExploreFilters["sort"]) => void;
  onToggleSpeciality: (specialitySlug: string) => void;
  searchInput: string;
  setDialogFilters: SetPhotographersBrowserDialogFilters;
  specialityLabelMap: Map<string, string>;
  totalCount: number;
  visibleCount: number;
}) {
  return (
    <form onSubmit={onSearchSubmit} className="mt-4 space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Search by photographer name"
            className="h-10 rounded-md border-slate-300 bg-white pl-10 text-sm shadow-none"
            disabled={isInteractionDisabled}
          />
        </div>

        <Button
          type="submit"
          className="h-10 rounded-md px-4 sm:self-start"
          disabled={isInteractionDisabled}
        >
          {isRefreshing ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select
          value={appliedFilters.sort}
          onValueChange={(value) =>
            onSortChange(value as PublicPhotographerExploreFilters["sort"])
          }
          disabled={isInteractionDisabled}
        >
          <SelectTrigger className="h-10 w-full rounded-md border-slate-300 bg-white px-3 shadow-none sm:w-[190px]">
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

        <BrowserFilterDialog
          open={isDialogOpen}
          onOpenChange={onDialogOpenChange}
          onOpen={onDialogOpen}
          onApply={onDialogApply}
          activeCount={dialogFilterCount}
          title="Refine photographers"
          description="Choose experience, city, and specialties to zero in on the exact kind of photographer you want to review."
          triggerLabel="More filters"
          applyLabel="Show matching photographers"
        >
          <PhotographersBrowserFilterDialogContent
            availableSpecialities={availableSpecialities}
            dialogFilters={dialogFilters}
            setDialogFilters={setDialogFilters}
            specialityLabelMap={specialityLabelMap}
            toggleSpeciality={onToggleSpeciality}
          />
        </BrowserFilterDialog>

        {hasActiveFilters ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-md px-3 text-slate-600"
            onClick={onResetAllFilters}
            disabled={isInteractionDisabled}
          >
            <RotateCcw className="size-4" />
            Reset
          </Button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span>{totalCount} photographers available</span>
          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
          <span>
            Showing {visibleCount} result{visibleCount === 1 ? "" : "s"}
          </span>
          {isRefreshing && (
            <>
              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
              <span>Refreshing results...</span>
            </>
          )}
        </div>

        {hasActiveFilters ? (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-slate-600">
              <span className="size-1.5 rounded-full bg-slate-900" />
              {activeFilterCount} active
              {activeFilterCount === 1 ? " filter" : " filters"}
            </span>
            <Button
              type="button"
              variant="ghost"
              className="h-7 rounded-md px-2 text-slate-600"
              onClick={onResetAllFilters}
              disabled={isInteractionDisabled}
            >
              <RotateCcw className="size-3" />
              Reset
            </Button>
          </div>
        ) : null}
      </div>
    </form>
  );
}
