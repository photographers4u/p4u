import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { type CityName, getCitySlug } from "@/lib/city-pages";

const POPULAR_CITIES: CityName[] = [
  "Mumbai",
  "Bengaluru",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Jaipur",
];

const QUICK_CATEGORIES = [
  { slug: "wedding", name: "Wedding" },
  { slug: "portrait", name: "Portrait" },
  { slug: "maternity-shoot", name: "Maternity" },
  { slug: "couple-shoot", name: "Couple" },
  { slug: "corporate-event", name: "Corporate" },
  { slug: "fashion-model", name: "Fashion" },
  { slug: "real-estate", name: "Real Estate" },
  { slug: "food-photography", name: "Food" },
];

export function MobileAppHome() {
  return (
    <section className="px-4 pt-3 pb-1 sm:hidden">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <Link
          href="/photographers"
          className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          All Photographers
        </Link>
        {QUICK_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/photographers?speciality=${category.slug}`}
            className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700"
          >
            {category.name}
          </Link>
        ))}
      </div>

      <div className="relative mt-4 overflow-hidden rounded-3xl bg-linear-to-br from-primary via-primary to-indigo-800 px-5 py-6 text-primary-foreground">
        <p className="text-xs font-medium text-white/75">India-wide network</p>
        <h2 className="mt-1 text-xl font-semibold leading-snug text-balance">
          Find your photographer in minutes
        </h2>
        <p className="mt-1.5 text-sm text-white/85">
          Compare verified portfolios and starting prices near you.
        </p>
        <Link
          href="/photographers"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-primary"
        >
          Browse photographers
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
          Popular cities
        </p>
        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {POPULAR_CITIES.map((city) => (
            <Link
              key={city}
              href={`/photographers/${getCitySlug(city)}`}
              className="shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700"
            >
              {city}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
