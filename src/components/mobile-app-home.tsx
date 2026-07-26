import { ArrowRight, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
} from "@/lib/photographer-presentation";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";

const POPULAR_CITIES = [
  { name: "Mumbai", slug: "mumbai", image: "/cities/Mumbai.png" },
  { name: "Bengaluru", slug: "bengaluru", image: "/cities/Bengaluru.png" },
  { name: "Pune", slug: "pune", image: "/cities/Pune.png" },
  { name: "Hyderabad", slug: "hyderabad", image: "/cities/Hydrabad.png" },
  { name: "Chennai", slug: "chennai", image: "/cities/Channai.png" },
  { name: "Kolkata", slug: "kolkata", image: "/cities/Kolkata.png" },
  { name: "Delhi", slug: "delhi", image: "/cities/Delhi.png" },
  { name: "Gurugram", slug: "gurugram", image: "/cities/Gurugram.png" },
] as const;

const FEATURED_PREVIEW_COUNT = 6;

function getLocationLabel(photographer: PublicPhotographerExploreEntry) {
  return (
    photographer.locationCity ||
    formatPhotographerCountry(photographer.locationCountry)
  );
}

export function MobileAppHome({
  featuredPhotographers,
}: {
  featuredPhotographers: PublicPhotographerExploreEntry[];
}) {
  const previewFeatured = featuredPhotographers.slice(
    0,
    FEATURED_PREVIEW_COUNT,
  );

  return (
    <section className="px-4 pt-3 pb-1 sm:hidden">
      <Link
        href="/photographers"
        className="flex items-center gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400"
      >
        <Search className="size-4 shrink-0" />
        Photographer, city or category
      </Link>

      <div className="relative mt-4 overflow-hidden rounded-[4px] bg-linear-to-br from-primary via-primary to-indigo-800 px-5 py-6 text-primary-foreground">
        <p className="text-xs font-medium text-white/75">India-wide network</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug text-balance">
          Hire top-rated photographers
        </h2>
        <p className="mt-1.5 text-sm text-white/85">
          Compare verified portfolios and starting prices near you.
        </p>
        <Link
          href="/photographers"
          className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-xs font-semibold text-primary"
        >
          Explore photographers
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-zinc-900">
          Explore photographers from top cities
        </p>
        <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_CITIES.map((city) => (
            <Link
              key={city.slug}
              href={`/photographers/${city.slug}`}
              className="flex w-20 shrink-0 flex-col items-center gap-2"
            >
              <ImageWithSkeleton
                src={city.image}
                alt={city.name}
                className="size-16 shrink-0 rounded-xl bg-zinc-100"
              />
              <span className="truncate text-xs font-medium text-zinc-700">
                {city.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {previewFeatured.length > 0 ? (
        <div className="mt-6 pb-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              Featured photographers
            </p>
            <Link
              href="/photographers"
              className="text-xs font-medium text-primary"
            >
              View all
            </Link>
          </div>
          <div className="mt-3 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {previewFeatured.map((photographer) => {
              const cover = photographer.uploads[0]?.imageUrl;
              const subtitle = photographer.specialities[0];

              return (
                <Link
                  key={photographer.id}
                  href={`/p/${photographer.slug}`}
                  className="w-36 shrink-0"
                >
                  <div className="aspect-4/5 overflow-hidden rounded-md bg-zinc-100">
                    {cover ? (
                      <ImageWithSkeleton
                        src={cover}
                        alt={photographer.name ?? "Photographer"}
                        className="h-full w-full"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-zinc-900">
                    {photographer.name ?? "Photographer"}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    {subtitle ?? formatPhotographerExperience(null)}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-zinc-400">
                    <MapPin className="size-3 shrink-0" />
                    {getLocationLabel(photographer)}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
