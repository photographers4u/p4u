import {
  CalendarDays,
  CircleDashed,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Video,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPhotographerReviewActions } from "@/components/review-workflow/admin-photographer-review-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAdminPhotographersReturnToPath } from "@/lib/admin-photographer-list";
import {
  formatPhotographerCountry,
  formatPhotographerExperience,
  getPhotographerStatusViewModel,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import { getAllowedPhotographerReviewStatuses } from "@/lib/photographer-status";
import { NotFoundError } from "@/server/db/helpers/errors";
import { getAdminPhotographerEntryById } from "@/server/services/photographer";
import { ONBOARDING_STEPS } from "@/zod/helpers";

const adminDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border border-border/70 shadow-sm">
      <CardHeader className="border-b border-border/70">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}

function DetailField({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "mono";
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p
        className={`mt-2 text-sm text-foreground ${
          tone === "mono" ? "font-mono break-all" : "leading-6"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ExternalValue({
  label,
  href,
  emptyLabel,
}: {
  label: string;
  href: string | null;
  emptyLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground transition hover:text-primary"
        >
          Open link
          <ExternalLink className="size-4" />
        </a>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </div>
  );
}

type AdminPhotographerDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminPhotographerDetailPage({
  params,
  searchParams,
}: AdminPhotographerDetailPageProps) {
  const { id } = await params;
  const returnTo = getAdminPhotographersReturnToPath(
    (await searchParams).returnTo,
  );

  try {
    const entry = await getAdminPhotographerEntryById(id);
    const allowedTransitions = getAllowedPhotographerReviewStatuses(entry);
    const hasReviewActions = allowedTransitions.length > 0;
    const status = getPhotographerStatusViewModel(entry);
    const location = entry.locationCity
      ? `${entry.locationCity}, ${formatPhotographerCountry(entry.locationCountry)}`
      : formatPhotographerCountry(entry.locationCountry);

    return (
      <div className="space-y-8">
        <section className="rounded-[2rem] border border-border/70 bg-[linear-gradient(135deg,rgba(248,250,252,0.92),rgba(255,255,255,1))] p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href={returnTo}>Back to queue</Link>
            </Button>
            <Badge variant={status.badgeVariant}>{status.label}</Badge>
            <Badge variant={entry.isPublished ? "secondary" : "outline"}>
              {entry.isPublished ? "Visible publicly" : "Hidden from public"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)] xl:items-end">
            <div className="flex items-start gap-5">
              <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-muted text-2xl font-semibold text-foreground/80">
                {entry.avatar ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                    <img
                      src={entry.avatar}
                      alt={entry.name ?? "Photographer avatar"}
                      className="h-full w-full object-cover"
                    />
                  </>
                ) : (
                  getProfileInitials(entry.name)
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Photographer Review
                </p>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {entry.name ?? "Untitled photographer profile"}
                  </h1>
                  <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                    Review the photographer&apos;s public-facing identity,
                    contact details, uploaded work, and moderation history in
                    one place before approving or sending feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
              <DetailField
                label="Onboarding"
                value={`Step ${entry.onboardingStep} of ${ONBOARDING_STEPS.length}`}
              />
              <DetailField
                label="Experience"
                value={formatPhotographerExperience(entry.experienceYears)}
              />
              <DetailField
                label="Updated"
                value={adminDateFormatter.format(entry.updatedAt)}
              />
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.55fr)_360px]">
          <div className="space-y-6">
            <SectionCard
              title="Profile overview"
              description="Core profile information exactly as it appears in the submission."
            >
              <div className="space-y-6">
                <div className="rounded-[1.75rem] border border-border/60 bg-muted/10 p-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    Bio
                  </p>
                  <p className="mt-3 text-sm leading-7 text-foreground">
                    {entry.bio?.trim()
                      ? entry.bio
                      : "No bio has been added yet."}
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailField
                    label="City"
                    value={entry.locationCity ?? "Not added yet"}
                  />
                  <DetailField
                    label="Country"
                    value={formatPhotographerCountry(entry.locationCountry)}
                  />
                  <ExternalValue
                    label="Instagram Reel"
                    href={entry.instagramReelUrl}
                    emptyLabel="No Instagram Reel has been added yet."
                  />
                  <ExternalValue
                    label="YouTube Video"
                    href={entry.youtubeVideoUrl}
                    emptyLabel="No YouTube video has been added yet."
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Contact details"
              description="Saved contact information and current public visibility settings."
            >
              {entry.contact ? (
                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailField label="Phone" value={entry.contact.phone} />
                  <DetailField label="Email" value={entry.contact.email} />
                  <DetailField
                    label="Email status"
                    value={
                      entry.contact.emailVerified ? "Verified" : "Not verified"
                    }
                  />
                  <DetailField
                    label="Visibility"
                    value={
                      entry.contact.isPublic
                        ? "Shown on the public profile"
                        : "Hidden from the public profile"
                    }
                  />
                </div>
              ) : (
                <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
                  No contact details have been added yet.
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Specialities"
              description="Offerings and starting prices currently attached to this photographer profile."
            >
              {entry.specialities.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
                  No specialities have been added yet.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {entry.specialities.map((speciality) => (
                    <div
                      key={speciality.id}
                      className="rounded-[1.5rem] border border-border/70 bg-background p-4 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {speciality.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        From Rs. {speciality.startingPrice}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            {(entry.status === "rejected" || entry.status === "on_hold") &&
            entry.rejectionReason ? (
              <Card className="border border-destructive/20 bg-destructive/8 shadow-sm">
                <CardHeader className="border-b border-destructive/20">
                  <CardTitle className="text-destructive">
                    {entry.status === "on_hold"
                      ? "Current hold reason"
                      : "Current rejection reason"}
                  </CardTitle>
                  <CardDescription className="text-destructive/80">
                    {entry.status === "on_hold"
                      ? "This feedback was sent when the photographer was placed on hold."
                      : "This feedback was sent when the photographer was rejected."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-sm leading-7 text-destructive">
                    {entry.rejectionReason}
                  </p>
                </CardContent>
              </Card>
            ) : null}

            <SectionCard
              title="Portfolio images"
              description="All uploaded review images currently attached to this photographer profile."
            >
              {entry.uploads.length === 0 ? (
                <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
                  No portfolio images have been added yet.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {entry.uploads.map((upload, index) => (
                    <div
                      key={upload.id}
                      className={`overflow-hidden rounded-[1.75rem] border border-border/70 bg-background shadow-sm ${
                        index === 0 ? "md:col-span-2" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
                        <p className="text-sm font-medium text-foreground">
                          Image {index + 1}
                        </p>
                        <Badge variant="outline">
                          Order {upload.displayOrder + 1}
                        </Badge>
                      </div>
                      <div className="aspect-[4/3] overflow-hidden bg-muted/20">
                        {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                        <img
                          src={upload.imageUrl}
                          alt={`Portfolio upload ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <SectionCard
              title="Moderation"
              description="Take the next valid review action for this photographer."
            >
              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-border/60 bg-muted/15 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-background p-2 shadow-sm">
                      <ShieldCheck className="size-4 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {status.label}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {status.adminDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {hasReviewActions ? (
                  <AdminPhotographerReviewActions
                    allowedTransitions={allowedTransitions}
                    photographerId={entry.id}
                    currentStatus={entry.status}
                    returnTo={returnTo}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This photographer is still a draft and can&apos;t be
                    reviewed until they submit the profile for moderation.
                  </p>
                )}
              </div>
            </SectionCard>

            <SectionCard
              title="At a glance"
              description="Moderation metadata and quick-reference profile facts."
            >
              <div className="grid gap-4">
                <DetailField label="Location" value={location} />
                <DetailField
                  label="Last reviewed"
                  value={
                    entry.reviewedAt
                      ? adminDateFormatter.format(entry.reviewedAt)
                      : "Not reviewed yet"
                  }
                />
                <DetailField
                  label="Created"
                  value={adminDateFormatter.format(entry.createdAt)}
                />
                <DetailField
                  label="Updated"
                  value={adminDateFormatter.format(entry.updatedAt)}
                />
                <DetailField label="Profile ID" value={entry.id} tone="mono" />
                <DetailField label="User ID" value={entry.userId} tone="mono" />
              </div>
            </SectionCard>

            <Card className="border border-border/70 shadow-sm">
              <CardContent className="grid gap-3 p-5">
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <Mail className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Contact email
                    </p>
                    <p className="text-sm text-foreground">
                      {entry.contact?.email ?? "Not added yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <Phone className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Phone
                    </p>
                    <p className="text-sm text-foreground">
                      {entry.contact?.phone ?? "Not added yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <MapPin className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Public location
                    </p>
                    <p className="text-sm text-foreground">{location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Onboarding progress
                    </p>
                    <p className="text-sm text-foreground">
                      Step {entry.onboardingStep} of {ONBOARDING_STEPS.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <Video className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Uploads
                    </p>
                    <p className="text-sm text-foreground">
                      {entry.uploadsCount} portfolio image
                      {entry.uploadsCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/10 p-3">
                  <CircleDashed className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      Email verification
                    </p>
                    <p className="text-sm text-foreground">
                      {entry.contact?.emailVerified
                        ? "Verified"
                        : "Not verified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
}
