import { Mail, MapPin, Phone } from "lucide-react";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { CopyLinkButton } from "@/components/copy-link-button";
import { Footer } from "@/components/footer";
import { ResponsiveMasonryGrid } from "@/components/masonary";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { getPublicPhotographerBySlug } from "@/server/services/photographer";

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
}: PublicPhotographerPageProps) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const forwardedProto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const forwardedHost =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const session = await getAuthSession({ headers: requestHeaders });

  try {
    const isAuthenticated = Boolean(session?.user);

    const photographer = await getPublicPhotographerBySlug(slug, {
      includeContactDetails: isAuthenticated,
    });

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

        <BookmarkProvider initialStore={initialBookmarkStore} session={session}>
          <main className="min-h-screen text-slate-900">
            <section className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:items-start lg:justify-between lg:text-left">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col items-center gap-4 sm:gap-5 lg:flex-row lg:items-start">
                      {photographer.avatar ? (
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-full ring-1 ring-slate-200 sm:size-24 lg:size-32">
                          {/* biome-ignore lint/performance/noImgElement: photographer avatars are stored on an external host */}
                          <img
                            src={photographer.avatar}
                            alt={photographer.name ?? "Photographer"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700 ring-1 ring-slate-200 sm:size-24 sm:text-2xl">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                          <h1
                            className={`text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl ${poppins.className}`}
                          >
                            {photographer.name ?? "Photographer"}
                          </h1>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[15px] text-slate-500 lg:justify-start">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="size-3.5 text-slate-400" />
                            {location}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span>
                            {formatPhotographerExperience(
                              photographer.experienceYears,
                            )}
                          </span>
                          {averageStartingPrice !== null ? (
                            <>
                              <span className="text-slate-300">&bull;</span>
                              <span className="font-medium text-slate-700">
                                Avg. charge {formatAverageCharge(averageStartingPrice)}
                              </span>
                            </>
                          ) : null}
                        </div>

                        {photographer.specialities.length > 0 && (
                          <div className="mt-4 flex flex-wrap justify-center gap-2 lg:justify-start">
                            {photographer.specialities.map((speciality) => (
                              <span
                                key={speciality.id}
                                className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700"
                              >
                                {speciality.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row items-center gap-3 lg:flex-wrap lg:justify-end">
                    {(photographer.contact?.phone ||
                      (!isAuthenticated && photographer.hasPublicContact)) && (
                      <Button asChild className="rounded-full px-5">
                        <Link
                          href={isAuthenticated ? `tel:${phoneHref}` : loginHref}
                        >
                          <Phone className="size-3.5" />
                          Call
                        </Link>
                      </Button>
                    )}

                    {(photographer.contact?.email ||
                      (!isAuthenticated && photographer.hasPublicContact)) && (
                      <Button
                        asChild
                        variant="outline"
                        className="rounded-full px-5"
                      >
                        <Link
                          href={
                            isAuthenticated
                              ? `mailto:${photographer.contact?.email ?? ""}`
                              : loginHref
                          }
                        >
                          <Mail className="size-3.5" />
                          Email
                        </Link>
                      </Button>
                    )}

                    <CopyLinkButton
                      url={publicPageUrl}
                      showLabel
                      className="px-5"
                    />

                    <BookmarkButton
                      identifier="photographer"
                      value={photographer.id}
                      size="icon-lg"
                    />
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
                        <ResponsiveMasonryGrid uploads={photographer.uploads} />
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
