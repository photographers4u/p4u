import { ArrowRight, Camera, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { type CityName, getCitySlug } from "@/lib/city-pages";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
} from "@/lib/photographer-presentation";
import type { PublicPhotographerExploreEntry } from "@/server/services/photographer";
import type { SpecialityFilterOption } from "@/server/services/speciality";

const POPULAR_CITIES = [
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
] as const satisfies readonly CityName[];

const CITY_IMAGES: Record<(typeof POPULAR_CITIES)[number], string> = {
  Mumbai:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/The_Gateway_of_India%2C_Mumbai.jpg/330px-The_Gateway_of_India%2C_Mumbai.jpg",
  Bengaluru:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Vidhana_Soudha_Bangalore.jpg/330px-Vidhana_Soudha_Bangalore.jpg",
  Pune: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Shaniwar_Wada%2C_Pune.jpg/330px-Shaniwar_Wada%2C_Pune.jpg",
  Hyderabad:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Charminar%2C_Hyderabad_01.jpg/330px-Charminar%2C_Hyderabad_01.jpg",
  Chennai:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Marina_Beach%2C_Chennai.jpg/330px-Marina_Beach%2C_Chennai.jpg",
  Kolkata:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Victoria_Memorial%2C_Kolkata_-_12.jpg/330px-Victoria_Memorial%2C_Kolkata_-_12.jpg",
  Jaipur:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Hawa_Mahal_Jaipur.jpg/330px-Hawa_Mahal_Jaipur.jpg",
};

const CATEGORIES_PREVIEW_COUNT = 8;
const FEATURED_PREVIEW_COUNT = 6;

function getLocationLabel(photographer: PublicPhotographerExploreEntry) {
  return (
    photographer.locationCity ||
    formatPhotographerCountry(photographer.locationCountry)
  );
}

export function MobileAppHome({
  categories,
  featuredPhotographers,
}: {
  categories: SpecialityFilterOption[];
  featuredPhotographers: PublicPhotographerExploreEntry[];
}) {
  const previewCategories = categories.slice(0, CATEGORIES_PREVIEW_COUNT);
  const previewFeatured = featuredPhotographers.slice(
    0,
    FEATURED_PREVIEW_COUNT,
  );

  return (
    <section className="px-4 pt-3 pb-1 sm:hidden">
      <Link
        href="/photographers"
        className="flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-400"
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
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary"
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
              key={city}
              href={`/photographers/${getCitySlug(city)}`}
              className="flex w-20 shrink-0 flex-col items-center gap-2"
            >
              <ImageWithSkeleton
                src={CITY_IMAGES[city]}
                alt={city}
                className="size-16 shrink-0 rounded-2xl bg-zinc-100"
              />
              <span className="truncate text-xs font-medium text-zinc-700">
                {city}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {previewCategories.length > 0 ? (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">Categories</p>
            <Link
              href="/photographers"
              className="text-xs font-medium text-primary"
            >
              View more
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {previewCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/photographers?speciality=${category.slug}`}
                className="flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-primary ring-1 ring-zinc-200">
                  <Camera className="size-5" />
                </span>
                <span className="min-w-0 text-sm font-medium leading-tight text-zinc-700">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

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
                  <div className="aspect-4/5 overflow-hidden rounded-xl bg-zinc-100">
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
