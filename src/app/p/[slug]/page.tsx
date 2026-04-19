import { BadgeCheck, Mail, MapPin, Phone, Sparkles } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookmarkButton } from "@/components/bookmark-button";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { spaceGrotesk } from "@/lib/fonts";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { getAuthSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/db/helpers/errors";
import { getPublicPhotographerBySlug } from "@/server/services/photographer";

type PublicPhotographerPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function PublicProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

export default async function PublicPhotographerPage({
  params,
}: PublicPhotographerPageProps) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const session = await getAuthSession({ headers: requestHeaders });

  try {
    const isAuthenticated = Boolean(session?.user);
    const photographer = await getPublicPhotographerBySlug(slug, {
      includeContactDetails: isAuthenticated,
    });
    const heroUpload = photographer.uploads[0] ?? null;
    const location = photographer.locationCity
      ? `${photographer.locationCity}, ${formatPhotographerCountry(photographer.locationCountry)}`
      : formatPhotographerCountry(photographer.locationCountry);
    const heroImage = heroUpload?.imageUrl ?? photographer.avatar ?? null;
    const isHeroImagePinned = Boolean(heroUpload?.pinnedAt);
    const loginHref = buildAuthRedirectPath("/login", {
      callbackUrl: `/p/${slug}`,
    });
    const phoneHref = photographer.contact?.phone.replace(/\s+/g, "") ?? "";

    return (
      <>
        <Navbar session={session} />
        <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#fffaf4_48%,#ffffff_100%)] text-slate-900">
          <section className="border-b border-slate-200/80">
            <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-18">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary" className="gap-1.5">
                    <BadgeCheck className="size-3.5" />
                    Verified photographer
                  </Badge>
                  <Badge variant="outline">Public profile</Badge>
                </div>

                <div className="space-y-4">
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="size-4" />
                    {location}
                  </p>
                  <h1
                    className={`text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl ${spaceGrotesk.className}`}
                  >
                    {photographer.name ?? "Photographer"}
                  </h1>
                  <p className="max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                    {photographer.bio?.trim()
                      ? photographer.bio
                      : "A reviewed photographer profile on Photographers4U."}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <PublicProfileStat label="Location" value={location} />
                  <PublicProfileStat
                    label="Experience"
                    value={formatPhotographerExperience(
                      photographer.experienceYears,
                    )}
                  />
                  <PublicProfileStat
                    label="Offerings"
                    value={`${photographer.specialities.length} ${photographer.specialities.length === 1 ? "service" : "services"}`}
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {photographer.contact?.phone ||
                  (!isAuthenticated && photographer.hasPublicContact) ? (
                    <Button asChild size="lg" className="rounded-full px-6">
                      <Link
                        href={isAuthenticated ? `tel:${phoneHref}` : loginHref}
                      >
                        <Phone className="size-4" />
                        Call photographer
                      </Link>
                    </Button>
                  ) : null}
                  <BookmarkButton
                    identifier="photographer"
                    value={photographer.id}
                    size="lg"
                    label="Save photographer"
                    activeLabel="Saved photographer"
                    className="rounded-full px-6"
                  />
                  {photographer.contact?.email ||
                  (!isAuthenticated && photographer.hasPublicContact) ? (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="rounded-full px-6"
                    >
                      <Link
                        href={
                          isAuthenticated
                            ? `mailto:${photographer.contact?.email ?? ""}`
                            : loginHref
                        }
                      >
                        <Mail className="size-4" />
                        Send email
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                {heroImage ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                    <img
                      src={heroImage}
                      alt={photographer.name ?? "Photographer"}
                      className="h-full min-h-[320px] w-full object-cover"
                    />
                    {isHeroImagePinned ? (
                      <div className="absolute left-4 top-4">
                        <Badge className="bg-white/92 text-slate-900 shadow-sm hover:bg-white">
                          Pinned image
                        </Badge>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex min-h-[320px] items-center justify-center bg-[radial-gradient(circle_at_top,#fbbf24_0%,#fef3c7_38%,#ffffff_100%)]">
                    <div className="flex size-28 items-center justify-center rounded-full bg-white text-4xl font-semibold text-slate-900 shadow-sm">
                      {getProfileInitials(photographer.name)}
                    </div>
                  </div>
                )}

                <div className="border-t border-slate-200 bg-white px-5 py-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                    <Sparkles className="size-4 text-amber-500" />
                    Reviewed and live on Photographers4U
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Public listing slug:{" "}
                    <span className="font-medium text-slate-900">
                      {photographer.slug}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Services
                  </p>
                  <h2
                    className={`text-2xl font-semibold tracking-tight text-slate-950 ${spaceGrotesk.className}`}
                  >
                    Specialities and starting prices
                  </h2>
                </div>

                <div className="grid gap-3">
                  {photographer.specialities.map((speciality) => (
                    <div
                      key={speciality.id}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                    >
                      <p className="text-base font-semibold text-slate-950">
                        {speciality.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Starting at Rs. {speciality.startingPrice}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">
                    Portfolio
                  </p>
                  <h2
                    className={`text-2xl font-semibold tracking-tight text-slate-950 ${spaceGrotesk.className}`}
                  >
                    Recent work
                  </h2>
                </div>

                {photographer.uploads.length === 0 ? (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-sm text-slate-500">
                    Portfolio images will appear here soon.
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {photographer.uploads.map((upload, index) => (
                      <div
                        key={upload.id}
                        className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm"
                      >
                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                          {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                          <img
                            src={upload.imageUrl}
                            alt={`${photographer.name ?? "Photographer"} portfolio work ${index + 1}`}
                            className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"
                          />
                          {upload.pinnedAt ? (
                            <div className="absolute left-3 top-3">
                              <Badge className="bg-white/92 text-slate-900 shadow-sm hover:bg-white">
                                Pinned
                              </Badge>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
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
