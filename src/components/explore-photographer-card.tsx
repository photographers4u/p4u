"use client";

import { ChevronLeft, ChevronRight, Dot, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkButton } from "@/components/bookmark-button";
import { Badge } from "@/components/ui/badge";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { cn } from "@/lib/utils";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";

function getLocationLabel(photographer: PublicPhotographerExploreEntry) {
  if (photographer.locationCity) return photographer.locationCity;
  return formatPhotographerCountry(photographer.locationCountry);
}

export function ExplorePhotographerCard({
  photographer,
}: {
  photographer: PublicPhotographerExploreEntry;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const uploads = photographer.uploads;
  const hasImages = uploads.length > 0;
  const location = getLocationLabel(photographer);
  const safeActiveIndex = hasImages
    ? Math.min(activeIndex, uploads.length - 1)
    : 0;

  useEffect(() => {
    setActiveIndex((index) =>
      uploads.length > 0 ? Math.min(index, uploads.length - 1) : 0,
    );
  }, [uploads.length]);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + uploads.length) % uploads.length);
  const next = () => setActiveIndex((i) => (i + 1) % uploads.length);

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="p-2 aspect-square">
        <div className="relative rounded-md border overflow-hidden w-full h-full bg-slate-100">
          {hasImages ? (
            <>
              {uploads.map((upload, i) => (
                // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
                <img
                  key={upload.id}
                  src={upload.imageUrl}
                  alt={`${photographer.name ?? "Photographer"} portfolio work ${i + 1}`}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
                    i === safeActiveIndex ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}

              {/* Three-zone overlay: LEFT | MID | RIGHT */}
              <div className="absolute inset-0 flex">
                {/* Left zone — prev button */}
                <div className="flex w-14 shrink-0 items-center justify-start pl-3">
                  {uploads.length > 1 && (
                    <button
                      type="button"
                      onClick={prev}
                      className="flex size-8 items-center justify-center rounded-full bg-white/30 cursor-pointer backdrop-blur shadow-sm ring-1 ring-black/5 transition hover:bg-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="size-4 text-slate-700" />
                    </button>
                  )}
                </div>

                {/* Middle zone — link to profile */}
                <Link
                  href={`/p/${photographer.slug}`}
                  className="flex-1"
                  aria-label={`View ${photographer.name ?? "Photographer"}'s profile`}
                  tabIndex={-1}
                />

                {/* Right zone — next button */}
                <div className="flex w-14 shrink-0 items-center justify-end pr-3">
                  {uploads.length > 1 && (
                    <button
                      type="button"
                      onClick={next}
                      className="flex size-8 items-center justify-center rounded-full bg-white/30 cursor-pointer backdrop-blur shadow-sm ring-1 ring-black/5 transition hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRight className="size-4 text-slate-700" />
                    </button>
                  )}
                </div>
              </div>

              {/* Dot indicators */}
              {uploads.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 pointer-events-none">
                  {uploads.map((upload, i) => (
                    <span
                      key={upload.id}
                      className={cn(
                        "rounded-full transition-all",
                        i === safeActiveIndex
                          ? "w-4 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50",
                      )}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center px-6">
              {photographer.avatar ? (
                // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
                <img
                  src={photographer.avatar}
                  alt={photographer.name ?? "Photographer"}
                  className="size-16 rounded-xl object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-xl bg-slate-900 text-base font-semibold text-white">
                  {getProfileInitials(photographer.name)}
                </div>
              )}
              <p className="text-sm font-medium text-slate-500">
                No portfolio images yet
              </p>
            </div>
          )}

          {/* Bookmark — top-right, above overlay */}
          <div className="absolute right-3 top-3 z-10">
            <BookmarkButton
              identifier="photographer"
              value={photographer.id}
              size="icon"
              label="Save photographer"
              activeLabel="Saved photographer"
              className="border-slate-200 bg-white/75 backdrop-blur"
            />
          </div>
        </div>
      </div>

      <Link
        href={`/p/${photographer.slug}`}
        className="flex flex-1 flex-col gap-y-2 p-3 pt-2 group"
      >
        <div className="flex items-center gap-3">
          {photographer.avatar ? (
            // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
            <img
              src={photographer.avatar}
              alt={photographer.name ?? "Photographer"}
              className="size-11 shrink-0 rounded-full object-cover ring-1 ring-black/5"
            />
          ) : (
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              {getProfileInitials(photographer.name)}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950 group-hover:text-primary">
              {photographer.name ?? "Photographer"}
            </h2>
            <div className="flex flex-wrap items-center gap-x-0.5 text-[13px] text-slate-500 mt-0.5">
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {location}
              </span>
              <Dot />
              <span>
                {formatPhotographerExperience(photographer.experienceYears)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {photographer.specialities.map((speciality) => (
            <Badge
              key={speciality}
              variant="outline"
              className="h-6 rounded-full border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-700"
            >
              {speciality}
            </Badge>
          ))}
          {photographer.remainingSpecialitiesCount > 0 && (
            <Badge
              variant="secondary"
              className="h-6 rounded-full bg-amber-100 px-2.5 text-xs text-amber-900"
            >
              +{photographer.remainingSpecialitiesCount} more
            </Badge>
          )}
        </div>
      </Link>
    </article>
  );
}
