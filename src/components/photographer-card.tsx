import { Clock3, MapPin } from "lucide-react";
import Link from "next/link";
import { BookmarkButton } from "@/components/bookmark-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
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

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#fff7ed_0%,#f8fafc_60%,#ffffff_100%)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              {eyebrow}
            </Badge>
            <div className="flex items-center gap-3">
              {photographer.avatar ? (
                // biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host
                <img
                  src={photographer.avatar}
                  alt={photographer.name ?? "Photographer"}
                  className="size-14 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white">
                  {getProfileInitials(photographer.name)}
                </div>
              )}
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-950">
                  <Link
                    href={`/p/${photographer.slug}`}
                    className="hover:underline underline-offset-4"
                  >
                    {photographer.name ?? "Photographer"}
                  </Link>
                </h2>
                <p className="flex items-center gap-1.5 text-sm text-slate-600">
                  <MapPin className="size-3.5" />
                  {location}
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
          />
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

        <Button asChild variant="outline" className="w-full">
          <Link href={`/p/${photographer.slug}`}>View profile</Link>
        </Button>
      </div>
    </article>
  );
}
