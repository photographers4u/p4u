import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/page-header";
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6 text-foreground">{value}</p>
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
        <PageHeader
          title="Photographer Details"
          subtitle="All photographer details are shown here in read-only mode for admin review."
        />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href={returnTo}>Back to photographers</Link>
          </Button>
        </div>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Admin review</CardTitle>
            <CardDescription>
              Only moderation actions that are valid for the photographer's
              current state are shown here.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {hasReviewActions ? (
              <AdminPhotographerReviewActions
                allowedTransitions={allowedTransitions}
                photographerId={entry.id}
                currentStatus={entry.status}
                returnTo={returnTo}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                This photographer is still a draft and can't be reviewed until
                they submit the profile for moderation.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-muted text-xl font-semibold text-foreground/80">
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

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle>
                      {entry.name ?? "Untitled photographer profile"}
                    </CardTitle>
                    <Badge variant={status.badgeVariant}>{status.label}</Badge>
                    <Badge
                      variant={entry.isPublished ? "secondary" : "outline"}
                    >
                      {entry.isPublished ? "Live" : "Hidden"}
                    </Badge>
                  </div>
                  <CardDescription>{status.adminDescription}</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <ReadOnlyField
              label="Bio"
              value={
                entry.bio?.trim() ? entry.bio : "No bio has been added yet."
              }
            />
            <ReadOnlyField
              label="Instagram Reel"
              value={
                entry.instagramReelUrl?.trim()
                  ? entry.instagramReelUrl
                  : "No Instagram Reel has been added yet."
              }
            />
            <ReadOnlyField
              label="YouTube video"
              value={
                entry.youtubeVideoUrl?.trim()
                  ? entry.youtubeVideoUrl
                  : "No YouTube video has been added yet."
              }
            />
            <ReadOnlyField
              label="City"
              value={entry.locationCity ?? "Not added yet"}
            />
            <ReadOnlyField
              label="Country"
              value={formatPhotographerCountry(entry.locationCountry)}
            />
            <ReadOnlyField
              label="Experience"
              value={formatPhotographerExperience(entry.experienceYears)}
            />
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Contact details</CardTitle>
            <CardDescription>
              Photographer contact information currently saved on the profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            {entry.contact ? (
              <>
                <ReadOnlyField label="Phone" value={entry.contact.phone} />
                <ReadOnlyField label="Email" value={entry.contact.email} />
                <ReadOnlyField
                  label="Email status"
                  value={
                    entry.contact.emailVerified ? "Verified" : "Not verified"
                  }
                />
                <ReadOnlyField
                  label="Visibility"
                  value={
                    entry.contact.isPublic
                      ? "Shown on the public profile"
                      : "Hidden from the public profile"
                  }
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No contact details have been added yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Review details</CardTitle>
            <CardDescription>
              Current moderation state and internal profile metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
            <ReadOnlyField label="Status" value={status.label} />
            <ReadOnlyField
              label="Onboarding step"
              value={`Step ${entry.onboardingStep} of ${ONBOARDING_STEPS.length}`}
            />
            <ReadOnlyField label="Location" value={location} />
            <ReadOnlyField
              label="Last reviewed"
              value={
                entry.reviewedAt
                  ? adminDateFormatter.format(entry.reviewedAt)
                  : "Not reviewed yet"
              }
            />
            <ReadOnlyField
              label="Created"
              value={adminDateFormatter.format(entry.createdAt)}
            />
            <ReadOnlyField
              label="Updated"
              value={adminDateFormatter.format(entry.updatedAt)}
            />
            <ReadOnlyField label="Profile ID" value={entry.id} />
            <ReadOnlyField label="User ID" value={entry.userId} />
          </CardContent>
        </Card>

        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Specialities</CardTitle>
            <CardDescription>
              Services and starting prices currently attached to this portfolio.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {entry.specialities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No specialities have been added yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {entry.specialities.map((speciality) => (
                  <div
                    key={speciality.id}
                    className="rounded-full border border-border/70 bg-muted/40 px-4 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {speciality.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      From Rs. {speciality.startingPrice}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {(entry.status === "rejected" || entry.status === "on_hold") &&
        entry.rejectionReason ? (
          <Card className="border border-destructive/20 bg-destructive/10 shadow-sm">
            <CardHeader className="border-b border-destructive/20">
              <CardTitle className="text-destructive">
                {entry.status === "on_hold"
                  ? "Hold reason"
                  : "Rejection reason"}
              </CardTitle>
              <CardDescription className="text-destructive/80">
                {entry.status === "on_hold"
                  ? "This reason was shared when the photographer was put on hold."
                  : "This reason was shared when the photographer was rejected."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-6 text-destructive">
                {entry.rejectionReason}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight">
              Portfolio images
            </h2>
            <p className="text-sm text-muted-foreground">
              Every portfolio image currently linked to this photographer
              profile.
            </p>
          </div>

          {entry.uploads.length === 0 ? (
            <div className="rounded-4xl border border-dashed border-border/70 bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
              No portfolio images have been added yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {entry.uploads.map((upload, index) => (
                <Card
                  key={`${upload.imageUrl}-${index}`}
                  className="border border-border/70 shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="aspect-4/3 overflow-hidden">
                      {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                      <img
                        src={upload.imageUrl}
                        alt={`Portfolio upload ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
