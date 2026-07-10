import { Mail, MapPin, Pencil, Phone, Plus } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { ContactActionButton } from "@/components/contact-action-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Footer } from "@/components/footer";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import Navbar from "@/components/navbar";
import { PhotographerVerificationBadge } from "@/components/photographer-verification-badge";
import { PhotographerWorkGallery } from "@/components/photographer-work-gallery";
import { ProfileHeroAvatar } from "@/components/profile-hero-avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { siteConfig } from "@/config/site";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { sanitizeBookmarkStore } from "@/lib/bookmark-store";
import { BookmarkProvider } from "@/lib/bookmarks-context";
import { poppins } from "@/lib/fonts";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { getYouTubeVideoEmbedUrl } from "@/lib/video-embeds";
import { getAuthSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/db/helpers/errors";
import { hasBookmarkByUserId } from "@/server/services/bookmark";
import { recordProfileView } from "@/server/services/photographer-event";
import {
  getCurrentPhotographer,
  getPreviewPhotographerBySlug,
  getPublicPhotographerBySlug,
} from "@/server/services/photographer";

type PhotographerMetadataParams = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PhotographerMetadataParams): Promise<Metadata> {
  const { slug } = await params;

  try {
    const photographer = await getPublicPhotographerBySlug(slug);
    const name = photographer.name ?? "Photographer";
    const city = photographer.locationCity;
    const locationLabel = city
      ? `${city}, ${formatPhotographerCountry(photographer.locationCountry)}`
      : formatPhotographerCountry(photographer.locationCountry);
    const title = city ? `${name} - Photographer in ${city}` : name;
    const socialTitle = `${title} | ${siteConfig.name}`;
    const description = photographer.bio?.trim()
      ? photographer.bio.trim().slice(0, 155)
      : `Hire ${name}, a verified photographer in ${locationLabel}, on ${siteConfig.name}. View portfolio, specialities, and starting prices.`;
    const image = photographer.avatar ?? photographer.uploads[0]?.imageUrl;

    return {
      title,
      description,
      alternates: { canonical: `/p/${slug}` },
      openGraph: {
        title: socialTitle,
        description,
        url: `/p/${slug}`,
        type: "profile",
        images: image ? [{ url: image }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: socialTitle,
        description,
        images: image ? [image] : undefined,
      },
    };
  } catch {
    return {};
  }
}

type SocialVideoEmbed = {
  aspectClassName: string;
  containerClassName: string;
  embedUrl: string;
  label: string;
  title: string;
};

type PublicPhotographerPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    preview?: string;
  }>;
};

function formatStartingPrice(price: number | string | null | undefined) {
  if (typeof price === "number") {
    return `\u20B9${price.toLocaleString("en-IN")}`;
  }

  if (typeof price === "string" && price.trim()) {
    return `\u20B9${price}`;
  }

  return "Custom pricing";
}

function formatAverageCharge(price: number | null) {
  if (price === null) {
    return "Custom pricing";
  }

  const roundedPrice = Math.round(price / 500) * 500;
  return `\u20B9${roundedPrice.toLocaleString("en-IN")}`;
}

function SocialVideoEmbedCard({ embed }: { embed: SocialVideoEmbed }) {
  return (
    <div
      className={`overflow-hidden rounded-md border border-slate-200 bg-slate-950 ${embed.containerClassName}`}
    >
      <div className={embed.aspectClassName}>
        <iframe
          src={embed.embedUrl}
          title={embed.title}
          className="h-full w-full border-0"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    </div>
  );
}

export default async function PublicPhotographerPage({
  params,
  searchParams,
}: PublicPhotographerPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "1";
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const [session, currentPhotographer] = await Promise.all([
    getAuthSession({ headers: requestHeaders }),
    getCurrentPhotographer(requestHeaders),
  ]);

  try {
    const isAuthenticated = Boolean(session?.user) || isPreview;

    const photographer = isPreview
      ? await getPreviewPhotographerBySlug(slug)
      : await getPublicPhotographerBySlug(slug, {
          includeContactDetails: isAuthenticated,
        });

    const isOwnProfile = currentPhotographer?.id === photographer.id;

    if (!isOwnProfile && !isPreview) {
      void recordProfileView({
        photographerId: photographer.id,
        viewerUserId: session?.user?.id ?? null,
      });
    }

    const isBookmarked = session?.user
      ? await hasBookmarkByUserId(
          session.user.id,
          "photographer",
          photographer.id,
        )
      : false;

    const initialBookmarkStore = sanitizeBookmarkStore({
      photographer: isBookmarked ? [photographer.id] : [],
    });

    const location = photographer.locationCity
      ? `${photographer.locationCity}, ${formatPhotographerCountry(
          photographer.locationCountry,
        )}`
      : formatPhotographerCountry(photographer.locationCountry);
    const loginHref = buildAuthRedirectPath("/login", {
      callbackUrl: `/p/${slug}`,
    });
    const phoneHref = photographer.contact?.phone.replace(/[^\d+]/g, "") ?? "";
    const initials = getProfileInitials(photographer.name);
    const profileName = photographer.name ?? "Photographer";
    const youtubeVideoEmbedUrl = getYouTubeVideoEmbedUrl(
      photographer.youtubeVideoUrl,
    );
    const socialVideoEmbeds: SocialVideoEmbed[] = [];
    const averageStartingPrice =
      photographer.specialities.length > 0
        ? Math.round(
            photographer.specialities.reduce(
              (total, speciality) => total + speciality.startingPrice,
              0,
            ) / photographer.specialities.length,
          )
        : null;
    const instagramHref = photographer.instagramReelUrl?.trim() || null;
    const publicPageUrl = forwardedHost
      ? `${forwardedProto}://${forwardedHost}/p/${slug}`
      : `/p/${slug}`;

    const photographerJsonLd = {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: profileName,
      url: `${siteConfig.url}/p/${slug}`,
      image: photographer.avatar ?? photographer.uploads[0]?.imageUrl,
      description: photographer.bio?.trim() || undefined,
      address: photographer.locationCity
        ? {
            "@type": "PostalAddress",
            addressLocality: photographer.locationCity,
            addressCountry: formatPhotographerCountry(
              photographer.locationCountry,
            ),
          }
        : undefined,
      sameAs: instagramHref ? [instagramHref] : undefined,
      priceRange:
        averageStartingPrice !== null
          ? `From Rs. ${averageStartingPrice}`
          : undefined,
      makesOffer: photographer.specialities.map((speciality) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: speciality.name },
        priceCurrency: "INR",
        price: speciality.startingPrice,
      })),
    };

    if (youtubeVideoEmbedUrl) {
      socialVideoEmbeds.push({
        aspectClassName: "aspect-video",
        containerClassName: "",
        embedUrl: youtubeVideoEmbedUrl,
        label: "YouTube video",
        title: `${profileName} YouTube video`,
      });
    }

    const youtubeEmbeds = socialVideoEmbeds.filter((embed) =>
      embed.label.toLowerCase().includes("youtube"),
    );

    const otherEmbeds = socialVideoEmbeds.filter((embed) => {
      const label = embed.label.toLowerCase();

      return !label.includes("youtube");
    });

    return (
      <>
        <Navbar session={session} />
        <MobileBottomNav session={session} />

        <BookmarkProvider initialStore={initialBookmarkStore} session={session}>
          {!isOwnProfile &&
          (photographer.contact?.phone ||
            (!isAuthenticated && photographer.hasPublicContact)) ? (
            <div
              className="fixed inset-x-0 z-40 mx-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.25)] backdrop-blur md:hidden"
              style={{
                bottom: "calc(4rem + env(safe-area-inset-bottom) + 0.75rem)",
              }}
            >
              <Button asChild className="h-11 flex-1 rounded-xl">
                <ContactActionButton
                  href={isAuthenticated ? `tel:${phoneHref}` : loginHref}
                  method="call"
                  photographerId={photographer.id}
                  shouldTrack={isAuthenticated}
                >
                  <Phone className="size-4" />
                  Call now
                </ContactActionButton>
              </Button>
              <BookmarkButton
                identifier="photographer"
                value={photographer.id}
                size="icon-lg"
                className="h-11 w-11 rounded-xl border-slate-200"
              />
            </div>
          ) : null}

          <main className="min-h-screen text-slate-900 pb-16 max-md:bg-neutral-50 max-md:pb-32">
            {!isPreview ? (
              <script
                type="application/ld+json"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD, no user input
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(photographerJsonLd),
                }}
              />
            ) : null}
            {isPreview ? (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-medium text-amber-800">
                Preview only — this profile is not live on Photographers4U yet.
              </div>
            ) : null}
            <section className="border-b border-slate-200/80 sm:bg-white">
              <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
                <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-center gap-4 sm:gap-5 lg:flex-row lg:items-start">
                      {photographer.avatar ? (
                        <ProfileHeroAvatar
                          src={photographer.avatar}
                          alt={photographer.name ?? "Photographer"}
                        />
                      ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 sm:size-24 sm:text-2xl">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                          <h1
                            className={`text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl ${poppins.className}`}
                          >
                            {photographer.name ?? "Photographer"}
                          </h1>
                          <PhotographerVerificationBadge
                            status={photographer.status}
                          />
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-6 lg:justify-start">
                          <div className="text-center lg:text-left">
                            <p className="text-base font-semibold text-slate-950">
                              {photographer.uploads.length}
                            </p>
                            <p className="text-xs text-slate-500">Work</p>
                          </div>
                          <div className="text-center lg:text-left">
                            <p className="text-base font-semibold text-slate-950">
                              {photographer.specialities.length}
                            </p>
                            <p className="text-xs text-slate-500">
                              Specialities
                            </p>
                          </div>
                          <div className="text-center lg:text-left">
                            <p className="text-base font-semibold text-slate-950">
                              {photographer.experienceYears ?? "—"}
                            </p>
                            <p className="text-xs text-slate-500">Years exp.</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-slate-500 sm:text-[15px] lg:justify-start">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-slate-400" />
                            {location}
                          </span>
                          {averageStartingPrice !== null ? (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <span className="font-medium text-slate-700">
                                Avg. charge{" "}
                                {formatAverageCharge(averageStartingPrice)}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {photographer.specialities.length > 0 && (
                          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                            {photographer.specialities.map((speciality) => (
                              <span
                                key={speciality.id}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {speciality.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 lg:justify-end">
                    {isOwnProfile ? (
                      <>
                        <Button asChild className="rounded-full px-5">
                          <Link href="/dashboard/portfolio">
                            <Pencil className="size-3.5" />
                            Edit profile
                          </Link>
                        </Button>

                        <Button
                          asChild
                          variant="outline"
                          className="rounded-full px-5"
                        >
                          <Link href="/dashboard/images">
                            <Plus className="size-3.5" />
                            Add work
                          </Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        {(photographer.contact?.phone ||
                          (!isAuthenticated &&
                            photographer.hasPublicContact)) && (
                          <div className="flex items-center gap-2 max-md:hidden">
                            <Button asChild className="rounded-full px-5">
                              <ContactActionButton
                                href={
                                  isAuthenticated
                                    ? `tel:${phoneHref}`
                                    : loginHref
                                }
                                method="call"
                                photographerId={photographer.id}
                                shouldTrack={isAuthenticated}
                              >
                                <Phone className="size-3.5" />
                                Call
                              </ContactActionButton>
                            </Button>

                            {isAuthenticated && photographer.contact?.phone ? (
                              <span className="text-sm font-medium text-slate-700">
                                {photographer.contact.phone}
                              </span>
                            ) : null}
                          </div>
                        )}

                        {(photographer.contact?.email ||
                          (!isAuthenticated &&
                            photographer.hasPublicContact)) && (
                          <Button
                            asChild
                            variant="outline"
                            className="rounded-full px-5"
                          >
                            <ContactActionButton
                              href={
                                isAuthenticated
                                  ? `mailto:${photographer.contact?.email ?? ""}`
                                  : loginHref
                              }
                              method="email"
                              photographerId={photographer.id}
                              shouldTrack={isAuthenticated}
                            >
                              <Mail className="size-3.5" />
                              Email
                            </ContactActionButton>
                          </Button>
                        )}
                      </>
                    )}

                    <CopyLinkButton
                      url={publicPageUrl}
                      showLabel
                      className="px-5"
                    />

                    {!isOwnProfile ? (
                      <BookmarkButton
                        identifier="photographer"
                        value={photographer.id}
                        size="icon-lg"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <Tabs defaultValue="images" className="space-y-6">
                <div className="border-b p-1">
                  <TabsList className="mx-auto w-full flex max-w-6xl rounded-none bg-transparent px-4 pb-10 p-0 sm:px-10 lg:px-12">
                    <TabsTrigger
                      value="images"
                      className="w-full rounded px-4 py-3.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Work
                    </TabsTrigger>
                    <TabsTrigger
                      value="about"
                      className="w-full rounded px-4 py-3.5 text-sm data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      About
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="mx-auto mt-0 max-w-6xl px-4 pb-10 sm:px-10 lg:px-12">
                  <TabsContent value="images" className="mt-0">
                    <div>
                      {photographer.uploads.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-16 text-center text-sm text-slate-400">
                          Portfolio images will appear here soon.
                        </div>
                      ) : (
                        <PhotographerWorkGallery
                          uploads={photographer.uploads}
                          photographerName={profileName}
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="about" className="mt-0">
                    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
                      <div className="space-y-10">
                        <section>
                          <div className="border-b border-slate-200 pb-5">
                            <h2
                              className={`text-xl font-semibold tracking-tight text-slate-950 ${poppins.className}`}
                            >
                              Profile
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                              A quick overview of the photographer and their
                              work.
                            </p>
                          </div>

                          <div className="grid gap-6 border-b border-slate-200 py-6 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-medium text-slate-500">
                                Location
                              </p>
                              <p className="mt-2 text-sm font-medium text-slate-800">
                                {location}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-medium text-slate-500">
                                Experience
                              </p>
                              <p className="mt-2 text-sm font-medium text-slate-800">
                                {formatPhotographerExperience(
                                  photographer.experienceYears,
                                )}
                              </p>
                            </div>
                          </div>
                        </section>

                        {photographer.bio?.trim() && (
                          <section>
                            <p className="text-sm font-semibold text-slate-950">
                              About
                            </p>
                            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                              {photographer.bio}
                            </p>
                          </section>
                        )}

                        {instagramHref ? (
                          <section className="border-t border-slate-200 pt-7">
                            <div className="mb-5">
                              <p className="text-sm font-semibold text-slate-950">
                                Instagram
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Check more on Instagram.
                              </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <p className="text-sm font-medium text-slate-900">
                                    More reels and recent updates
                                  </p>
                                  <p className="mt-1 text-sm text-slate-500">
                                    Open Instagram to explore more from this
                                    photographer.
                                  </p>
                                </div>

                                <Button
                                  asChild
                                  variant="outline"
                                  className="rounded-full px-4 h-fit py-2"
                                >
                                  <Link
                                    href={instagramHref}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Image
                                      src="/instagram-colored.svg"
                                      alt=""
                                      width={16}
                                      height={16}
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                    Check more on Instagram
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </section>
                        ) : null}

                        {socialVideoEmbeds.length > 0 ? (
                          <section className="border-t border-slate-200 pt-7">
                            <div className="mb-5">
                              <p className="text-sm font-semibold text-slate-950">
                                {socialVideoEmbeds.length > 1
                                  ? "Featured videos"
                                  : "Featured video"}
                              </p>
                              <p className="mt-1 text-sm text-slate-500">
                                Recent work shared across social platforms.
                              </p>
                            </div>

                            <div className="space-y-5">
                              {youtubeEmbeds.map((embed) => (
                                <SocialVideoEmbedCard
                                  key={embed.embedUrl}
                                  embed={{
                                    ...embed,
                                    aspectClassName: "aspect-video",
                                    containerClassName: "",
                                  }}
                                />
                              ))}

                              {otherEmbeds.map((embed) => (
                                <SocialVideoEmbedCard
                                  key={embed.embedUrl}
                                  embed={embed}
                                />
                              ))}
                            </div>
                          </section>
                        ) : null}
                      </div>

                      <aside>
                        <div className="border-b border-slate-200 pb-5">
                          <h2
                            className={`text-xl font-semibold tracking-tight text-slate-950 ${poppins.className}`}
                          >
                            Specialities
                          </h2>
                          <p className="mt-1 text-sm text-slate-500">
                            Services and starting prices.
                          </p>
                        </div>

                        {photographer.specialities.length === 0 ? (
                          <div className="border-b border-slate-200 py-8">
                            <p className="text-sm text-slate-400">
                              No specialities listed yet.
                            </p>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {photographer.specialities.map((speciality) => (
                              <div key={speciality.id} className="py-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-slate-950">
                                      {speciality.name}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                      Service speciality
                                    </p>
                                  </div>

                                  <p className="shrink-0 text-sm font-medium text-slate-800">
                                    {formatStartingPrice(
                                      speciality.startingPrice,
                                    )}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </aside>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </section>
          </main>
        </BookmarkProvider>

        <Footer />
      </>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}
