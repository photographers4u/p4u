"use client";

import { ChevronLeft, ChevronRight, Dot, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BookmarkButton } from "@/components/bookmark-button";
import { PhotographerVerificationBadge } from "@/components/photographer-verification-badge";
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

function PhotographerPortfolioGallery({
  photographer,
  uploads,
}: {
  photographer: PublicPhotographerExploreEntry;
  uploads: PublicPhotographerExploreEntry["uploads"];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = Math.min(activeIndex, uploads.length - 1);

  useEffect(() => {
    setActiveIndex((index) => Math.min(index, uploads.length - 1));
  }, [uploads.length]);

  const prev = () =>
    setActiveIndex((i) => (i - 1 + uploads.length) % uploads.length);
  const next = () => setActiveIndex((i) => (i + 1) % uploads.length);

  return (
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

      <div className="absolute inset-0 flex">
        <div className="flex w-14 shrink-0 items-center justify-start pl-3">
          {uploads.length > 1 ? (
            <button
              type="button"
              onClick={prev}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/30 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="size-4 text-slate-700" />
            </button>
          ) : null}
        </div>

        <Link
          href={`/p/${photographer.slug}`}
          className="flex-1"
          aria-label={`View ${photographer.name ?? "Photographer"}'s profile`}
          tabIndex={-1}
        />

        <div className="flex w-14 shrink-0 items-center justify-end pr-3">
          {uploads.length > 1 ? (
            <button
              type="button"
              onClick={next}
              className="flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/30 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="size-4 text-slate-700" />
            </button>
          ) : null}
        </div>
      </div>

      {uploads.length > 1 ? (
        <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {uploads.map((upload, i) => (
            <span
              key={upload.id}
              className={cn(
                "rounded-full transition-all",
                i === safeActiveIndex
                  ? "h-1.5 w-4 bg-white"
                  : "h-1.5 w-1.5 bg-white/50",
              )}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

function PhotographerPortfolioCover({
  photographer,
  uploads,
}: {
  photographer: PublicPhotographerExploreEntry;
  uploads: PublicPhotographerExploreEntry["uploads"];
}) {
  return (
    <Link
      href={`/p/${photographer.slug}`}
      className="absolute inset-0"
      aria-label={`View ${photographer.name ?? "Photographer"}'s profile`}
    >
      {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
      <img
        src={uploads[0].imageUrl}
        alt={`${photographer.name ?? "Photographer"} portfolio cover`}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </Link>
  );
}

export function ExplorePhotographerCard({
  photographer,
  className,
  imageMode = "gallery",
}: {
  photographer: PublicPhotographerExploreEntry;
  className?: string;
  imageMode?: "cover" | "gallery";
}) {
  const uploads = photographer.uploads;
  const hasImages = uploads.length > 0;
  const location = getLocationLabel(photographer);
  const showGallery = imageMode === "gallery" && hasImages;

  return (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-lg sm:shadow-none",
        className,
      )}
    >
      <div className="aspect-square">
        <div className="relative h-full w-full overflow-hidden border-b bg-slate-100">
          {hasImages ? (
            showGallery ? (
              <PhotographerPortfolioGallery
                photographer={photographer}
                uploads={uploads}
              />
            ) : (
              <PhotographerPortfolioCover
                photographer={photographer}
                uploads={uploads}
              />
            )
          ) : (
            <Link
              href={`/p/${photographer.slug}`}
              className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center"
              aria-label={`View ${photographer.name ?? "Photographer"}'s profile`}
            >
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
            </Link>
          )}

          <div className="absolute right-3 top-3 z-10">
            <BookmarkButton
              identifier="photographer"
              value={photographer.id}
              size="icon"
              label="Save photographer"
              activeLabel="Saved photographer"
              className="border-slate-200 bg-white"
            />
          </div>
        </div>
      </div>

      <Link
        href={`/p/${photographer.slug}`}
        className="group flex flex-1 flex-col gap-y-2 p-2.5 sm:gap-y-3 sm:p-4"
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {photographer.avatar ? (
            // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
            <img
              src={photographer.avatar}
              alt={photographer.name ?? "Photographer"}
              className="size-9 shrink-0 rounded-full object-cover ring-1 ring-black/5 sm:size-11"
            />
          ) : (
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white sm:size-11 sm:text-sm">
              {getProfileInitials(photographer.name)}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-[13px] font-semibold text-slate-950 sm:text-base">
              {photographer.name ?? "Photographer"}
            </h2>
            <PhotographerVerificationBadge
              status={photographer.status}
              className="mt-0.5 sm:mt-1"
            />
            <div className="mt-0.5 flex flex-wrap items-center gap-x-0.5 text-[11px] text-slate-500 sm:text-[13px]">
              <span className="inline-flex items-center gap-1 truncate">
                <MapPin className="size-3 shrink-0 sm:size-3.5" />
                {location}
              </span>
              <Dot className="hidden sm:block" />
              <span className="hidden sm:inline">
                {formatPhotographerExperience(photographer.experienceYears)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {photographer.specialities.map((speciality) => (
            <Badge
              key={speciality}
              variant="outline"
              className="h-5 rounded-md border-slate-200 bg-slate-50 px-1.5 text-[10px] text-slate-700 sm:h-6 sm:px-2.5 sm:text-xs"
            >
              {speciality}
            </Badge>
          ))}
          {photographer.remainingSpecialitiesCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-5 rounded-md bg-slate-100 px-1.5 text-[10px] text-slate-700 sm:h-6 sm:px-2.5 sm:text-xs"
            >
              +{photographer.remainingSpecialitiesCount} more
            </Badge>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
