import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPhotographerExperience } from "@/lib/photographer-presentation";
import type { SpecialityFilterOption } from "@/server/services/speciality";
import { CITIES, EXPERIENCE_YEARS } from "@/zod/helpers";
import type {
  PhotographersBrowserDialogFilters,
  SetPhotographersBrowserDialogFilters,
} from "./photographers-browser-types";

const ALL_FILTER_VALUE = "__all__";

export function PhotographersBrowserFilterDialogContent({
  availableSpecialities,
  dialogFilters,
  setDialogFilters,
  specialityLabelMap,
  toggleSpeciality,
}: {
  availableSpecialities: SpecialityFilterOption[];
  dialogFilters: PhotographersBrowserDialogFilters;
  setDialogFilters: SetPhotographersBrowserDialogFilters;
  specialityLabelMap: Map<string, string>;
  toggleSpeciality: (specialitySlug: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">Experience</p>
            <p className="text-sm leading-6 text-slate-600">
              Narrow the list by how long a photographer has been working
              professionally.
            </p>
          </div>

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
            <SelectTrigger className="h-11! w-full rounded-lg! border-slate-300 bg-white px-4 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>Any experience</SelectItem>
              {EXPERIENCE_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {formatPhotographerExperience(year)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>

        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">Location</p>
            <p className="text-sm leading-6 text-slate-600">
              Focus on one city when you already know where the shoot needs to
              happen.
            </p>
          </div>

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
            <SelectTrigger className="h-11! w-full rounded-lg! border-slate-300 bg-white px-4 shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_FILTER_VALUE}>Any location</SelectItem>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </section>
      </div>

      <section className="space-y-4 border-t border-slate-200 pt-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900">Specialities</p>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              Pick one or more specialties to surface photographers that already
              work in your category.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              {dialogFilters.specialities.length} selected
            </span>
            <button
              type="button"
              onClick={() => {
                setDialogFilters({
                  experience: null,
                  location: null,
                  specialities: [],
                });
              }}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              Clear all
            </button>
          </div>
        </div>

        {dialogFilters.specialities.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dialogFilters.specialities.map((specialitySlug) => (
              <Badge
                key={specialitySlug}
                variant="outline"
                className="h-8 rounded-full border-slate-300 bg-white px-3 text-xs text-slate-700"
              >
                {specialityLabelMap.get(specialitySlug) ?? specialitySlug}
              </Badge>
            ))}
          </div>
        ) : null}

        <div className="max-h-[44vh] overflow-y-auto border border-slate-200 p-3 sm:p-4">
          <div className="flex flex-wrap gap-2.5">
            {availableSpecialities.map((speciality) => {
              const isSelected = dialogFilters.specialities.includes(
                speciality.slug,
              );

              return (
                <Button
                  key={speciality.slug}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSpeciality(speciality.slug)}
                  className="h-9! rounded-full px-3.5"
                >
                  {speciality.name}
                </Button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
