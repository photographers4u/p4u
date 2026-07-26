import Image from "next/image";
import Link from "next/link";

const POPULAR_CITIES = [
  { name: "Pune", slug: "pune", image: "/cities/Pune.png", badge: "Popular" },
  { name: "Mumbai", slug: "mumbai", image: "/cities/Mumbai.png" },
  { name: "Hyderabad", slug: "hyderabad", image: "/cities/Hydrabad.png" },
  { name: "Bengaluru", slug: "bengaluru", image: "/cities/Bengaluru.png" },
  { name: "Delhi", slug: "delhi", image: "/cities/Delhi.png" },
  { name: "Gurugram", slug: "gurugram", image: "/cities/Gurugram.png" },
  { name: "Kolkata", slug: "kolkata", image: "/cities/Kolkata.png" },
  { name: "Chennai", slug: "chennai", image: "/cities/Channai.png" },
] as const;

export function PopularCities() {
  return (
    <div className="mx-auto grid w-[80vw] grid-cols-2 gap-4 lg:grid-cols-4">
      {POPULAR_CITIES.map((city) => (
        <Link
          key={city.slug}
          href={`/photographers/${city.slug}`}
          className="group relative aspect-3/4 overflow-hidden rounded-[4px] bg-zinc-100"
        >
          <Image
            src={city.image}
            alt={city.name}
            fill
            sizes="(min-width: 1024px) 18vw, 36vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

          {"badge" in city ? (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-900 backdrop-blur">
              {city.badge}
            </span>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-4">
            <p className="text-lg font-semibold text-white">{city.name}</p>
            <p className="mt-0.5 text-xs text-white/80">
              Explore photographers
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
