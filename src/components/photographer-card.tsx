"use client";

import { Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { PhotographerVerificationBadge } from "@/components/photographer-verification-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { cn } from "@/lib/utils";
import type { PublicPhotographerListEntry } from "@/server/services/photographer";

function getLocationLabel(photographer: PublicPhotographerListEntry) {
  if (photographer.locationCity) {
    return `${photographer.locationCity}, ${formatPhotographerCountry(
      photographer.locationCountry,
    )}`;
  }

  return formatPhotographerCountry(photographer.locationCountry);
}

export function PhotographerCard({
  photographer,
  eyebrow = "Photographer",
}: {
  photographer: PublicPhotographerListEntry;
  eyebrow?: string;
}) {
  const location = getLocationLabel(photographer);
  const avatar = useImageLoaded();

  return (
    <article className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="absolute right-5 top-5 z-10">
        <BookmarkButton
          identifier="photographer"
          value={photographer.id}
          size="icon-sm"
          label="Save photographer"
          activeLabel="Saved photographer"
        />
      </div>

      <Link href={`/p/${photographer.slug}`} className="block">
        <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_60%,#ffffff_100%)] p-5">
          <div className="space-y-3 pr-12">
            <Badge variant="secondary" className="w-fit">
              {eyebrow}
            </Badge>
            <div className="flex items-center gap-3">
              {photographer.avatar ? (
                <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl">
                  {avatar.isLoaded ? null : (
                    <Skeleton className="absolute inset-0 rounded-2xl" />
                  )}
                  {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                  <img
                    ref={avatar.ref}
                    src={photographer.avatar}
                    alt={photographer.name ?? "Photographer"}
                    loading="lazy"
                    decoding="async"
                    onLoad={avatar.onLoad}
                    onError={avatar.onError}
                    className={cn(
                      "size-14 rounded-2xl object-cover transition-opacity duration-300",
                      avatar.isLoaded ? "opacity-100" : "opacity-0",
                    )}
                  />
                </div>
              ) : (
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {getProfileInitials(photographer.name)}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-950">
                  {photographer.name ?? "Photographer"}
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="size-3.5" />
                  {location}
                </p>
                <PhotographerVerificationBadge status={photographer.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <p className="line-clamp-3 min-h-[4.5rem] text-sm leading-7 text-slate-600">
            {photographer.bio?.trim()
              ? photographer.bio
              : "Reviewed photographer profile on Photographers4U."}
          </p>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Clock3 className="size-4" />
            {formatPhotographerExperience(photographer.experienceYears)}
          </div>

          <span
            className={cn(buttonVariants({ variant: "outline" }), "w-full")}
          >
            View profile
          </span>
        </div>
      </Link>
    </article>
  );
}
