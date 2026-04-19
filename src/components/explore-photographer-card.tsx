import { ArrowRight, Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { cn } from "@/lib/utils";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";

function getLocationLabel(photographer: PublicPhotographerExploreEntry) {
  if (photographer.locationCity) {
    return photographer.locationCity;
  }

  return formatPhotographerCountry(photographer.locationCountry);
}

function getGalleryGridClass(uploadCount: number) {
  if (uploadCount === 1) {
    return "grid-cols-1";
  }

  if (uploadCount === 2) {
    return "grid-cols-2";
  }

  return "grid-cols-3";
}

function getGalleryItemClass(uploadCount: number) {
  if (uploadCount === 1) {
    return "aspect-[16/10]";
  }

  if (uploadCount === 2) {
    return "aspect-[4/5]";
  }

  return "aspect-square";
}

export function ExplorePhotographerCard({
  photographer,
}: {
  photographer: PublicPhotographerExploreEntry;
}) {
  const location = getLocationLabel(photographer);
  const galleryItemClass =
    photographer.uploads.length > 0
      ? getGalleryItemClass(photographer.uploads.length)
      : null;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-200/90 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.5)]">
      <div className="border-b border-slate-200/80 bg-[linear-gradient(145deg,#fff7ed_0%,#fffbeb_28%,#f8fafc_100%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {photographer.avatar ? (
              // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
              <img
                src={photographer.avatar}
                alt={photographer.name ?? "Photographer"}
                className="size-16 rounded-[1.35rem] object-cover ring-1 ring-black/5"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-[1.35rem] bg-slate-900 text-base font-semibold text-white">
                {getProfileInitials(photographer.name)}
              </div>
            )}

            <div className="min-w-0 space-y-1.5">
              <h2 className="truncate text-xl font-semibold tracking-tight text-slate-950">
                <Link
                  href={`/p/${photographer.slug}`}
                  className="transition-colors hover:text-amber-700"
                >
                  {photographer.name ?? "Photographer"}
                </Link>
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
                <p className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {location}
                </p>
                <p className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" />
                  {formatPhotographerExperience(photographer.experienceYears)}
                </p>
              </div>
            </div>
          </div>

          <BookmarkButton
            identifier="photographer"
            value={photographer.id}
            size="icon-sm"
            label="Save photographer"
            activeLabel="Saved photographer"
            className="border-slate-200 bg-white/85 backdrop-blur"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-5 p-5">
        <div className="flex flex-wrap gap-2">
          {photographer.specialities.map((speciality) => (
            <Badge
              key={speciality}
              variant="outline"
              className="h-7 rounded-full border-slate-200 bg-slate-50 px-3 text-slate-700"
            >
              {speciality}
            </Badge>
          ))}

          {photographer.remainingSpecialitiesCount > 0 ? (
            <Badge
              variant="secondary"
              className="h-7 rounded-full bg-amber-100 px-3 text-amber-900"
            >
              +{photographer.remainingSpecialitiesCount} more
            </Badge>
          ) : null}
        </div>

        {photographer.uploads.length > 0 && galleryItemClass ? (
          <div
            className={cn(
              "grid gap-3",
              getGalleryGridClass(photographer.uploads.length),
            )}
          >
            {photographer.uploads.map((upload, index) => (
              <div
                key={upload.id}
                className={cn(
                  "overflow-hidden rounded-[1.35rem] border border-slate-200 bg-slate-100",
                  galleryItemClass,
                )}
              >
                {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                <img
                  src={upload.imageUrl}
                  alt={`${photographer.name ?? "Photographer"} portfolio work ${index + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-[radial-gradient(circle_at_top,#fff7ed,#f8fafc_65%)] p-6">
            <div className="flex min-h-52 flex-col items-center justify-center gap-3 text-center">
              {photographer.avatar ? (
                // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
                <img
                  src={photographer.avatar}
                  alt={photographer.name ?? "Photographer"}
                  className="size-20 rounded-[1.6rem] object-cover ring-1 ring-black/5"
                />
              ) : (
                <div className="flex size-20 items-center justify-center rounded-[1.6rem] bg-slate-900 text-lg font-semibold text-white">
                  {getProfileInitials(photographer.name)}
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-900">
                  Portfolio coming soon
                </p>
                <p className="text-sm text-slate-500">
                  This photographer hasn&apos;t uploaded showcase images yet.
                </p>
              </div>
            </div>
          </div>
        )}

        <Button
          asChild
          variant="outline"
          className="mt-auto h-10 w-full rounded-full border-slate-300 bg-slate-50/80 hover:bg-slate-100"
        >
          <Link href={`/p/${photographer.slug}`}>
            View profile
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
