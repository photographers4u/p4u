import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { sanitizeBookmarkStore } from "@/lib/bookmark-store";
import { BookmarkProvider } from "@/lib/bookmarks-context";
import {
  COMING_SOON_CITIES,
  getCanonicalCitySlugRedirect,
  getCitySlug,
  resolveCityFromSlug,
} from "@/lib/city-pages";
import {
  DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS,
  PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE,
} from "@/lib/public-photographer-explore";
import { getAuthSession } from "@/server/auth/session";
import { getBookmarkValuesByIdentifier } from "@/server/services/bookmark";
import { getPublicPhotographerExplorePage } from "@/server/services/photographer";
import { CITIES } from "@/zod/helpers";
import { CityPhotographersGrid } from "./city-photographers-grid";

type CityPageProps = {
  params: Promise<{ city: string }>;
};

export function generateStaticParams() {
  return CITIES.map((city) => ({ city: getCitySlug(city) }));
}

function buildCityFaq(cityName: string) {
  return [
    {
      question: `How much do photographers in ${cityName} charge?`,
      answer: `Pricing on Photographers4U varies by photographer, experience, and package, with most ${cityName} photographers listing a starting price for weddings, portraits, and events directly on their profile so you can compare before reaching out.`,
    },
    {
      question: `How do I book a photographer in ${cityName} on Photographers4U?`,
      answer: `Browse verified ${cityName} photographer profiles, compare portfolios and starting prices, then contact your shortlisted photographer directly through their profile to discuss dates and packages.`,
    },
    {
      question: "Are photographers on Photographers4U verified?",
      answer:
        "Every photographer profile goes through a manual admin review, including portfolio and contact verification, before it's published on Photographers4U.",
    },
  ];
}

export async function generateMetadata({
  params,
}: CityPageProps): Promise<Metadata> {
  const { city: citySlug } = await params;
  const cityName =
    resolveCityFromSlug(citySlug) ?? COMING_SOON_CITIES[citySlug];

  if (!cityName) {
    return {};
  }

  const title = `Hire Photographers in ${cityName}`;
  const socialTitle = `${title} | ${siteConfig.name}`;
  const description = `Find and hire verified wedding, portrait, and event photographers in ${cityName}. Compare portfolios, specialities, and starting prices on ${siteConfig.name}.`;
  const path = `/photographers/${citySlug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
    },
  };
}

export default async function CityPhotographersPage({ params }: CityPageProps) {
  const { city: citySlug } = await params;
  const canonicalRedirect = getCanonicalCitySlugRedirect(citySlug);

  if (canonicalRedirect) {
    redirect(`/photographers/${canonicalRedirect}`);
  }

  const cityName = resolveCityFromSlug(citySlug);
  const comingSoonLabel = COMING_SOON_CITIES[citySlug];

  if (!cityName && !comingSoonLabel) {
    notFound();
  }

  const requestHeaders = await headers();
  const session = await getAuthSession({ headers: requestHeaders });
  const displayName = cityName ?? comingSoonLabel ?? citySlug;
  const faq = buildCityFaq(displayName);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "Photographers",
        item: `${siteConfig.url}/photographers`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: displayName,
        item: `${siteConfig.url}/photographers/${citySlug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  let initialPage: Awaited<
    ReturnType<typeof getPublicPhotographerExplorePage>
  > | null = null;

  if (cityName) {
    initialPage = await getPublicPhotographerExplorePage(
      { ...DEFAULT_PUBLIC_PHOTOGRAPHER_EXPLORE_FILTERS, location: cityName },
      { page: 1, pageSize: PUBLIC_PHOTOGRAPHER_EXPLORE_PAGE_SIZE },
    );
  }

  const bookmarkedPhotographerIds = session?.user
    ? await getBookmarkValuesByIdentifier(session.user.id, "photographer")
    : [];
  const initialBookmarkStore = sanitizeBookmarkStore({
    photographer: bookmarkedPhotographerIds,
  });

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen">
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Hire Photographers in {displayName}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              {cityName
                ? `Browse verified wedding, portrait, and event photographers in ${displayName}. Compare portfolios and starting prices, then connect directly.`
                : `We're onboarding photographers in ${displayName} right now. Want early access, or are you a photographer in ${displayName}? Join Photographers4U.`}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-5">
                <Link href="/register">Join as a photographer</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-5">
                <Link href="/photographers">Browse all cities</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          {cityName && initialPage ? (
            <BookmarkProvider
              initialStore={initialBookmarkStore}
              session={session}
            >
              <CityPhotographersGrid
                city={cityName}
                initialPage={initialPage}
              />
            </BookmarkProvider>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white px-6 py-12 text-center">
              <h2 className="text-xl font-semibold text-slate-950">
                No photographers in {displayName} yet
              </h2>
              <p className="mt-2 text-slate-600">
                Be the first photographer to claim {displayName}, or explore
                photographers in nearby cities.
              </p>
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-slate-950">
              Frequently asked questions
            </h2>
            <div className="mt-6 space-y-6">
              {faq.map((item) => (
                <div key={item.question}>
                  <p className="font-medium text-slate-900">{item.question}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
