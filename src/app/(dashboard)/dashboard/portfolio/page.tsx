import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PhotographerOnboardingUnderReview } from "@/components/forms/photographer-onboarding/under-review";
import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  isApprovedPhotographer,
  isPhotographerPendingReview,
} from "@/lib/photographer-status";
import { getServerAccount } from "@/lib/server-api";
import { getPhotographerPortfolioPageData } from "@/lib/photographer-panel";
import { specialityDal } from "@/server/db/dal/speciality";
import type { PhotographerOnboardingState } from "@/zod/schema/photographer";

function getProfileInitials(name: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getExperienceLabel(experienceYears: string | null) {
  if (!experienceYears) {
    return "Not added yet";
  }

  return experienceYears === "1"
    ? "1 year experience"
    : `${experienceYears} years experience`;
}

function getStatusDetails(state: PhotographerOnboardingState) {
  if (isApprovedPhotographer(state)) {
    return {
      description:
        "Your approved photographer profile is locked here in read-only mode.",
      label: "Approved",
      variant: "default" as const,
    };
  }

  if (state.status === "rejected") {
    return {
      description:
        "This photographer profile is currently locked and shown in read-only mode.",
      label: "Rejected",
      variant: "destructive" as const,
    };
  }

  return {
    description:
      "Your photographer profile is currently locked and shown in read-only mode.",
    label: "Draft",
    variant: "outline" as const,
  };
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm leading-6 text-foreground">{value}</p>
    </div>
  );
}

export default async function PortfolioPage() {
  const requestHeaders = await headers();
  const [{ onboarding }, account] = await Promise.all([
    getPhotographerPortfolioPageData(requestHeaders),
    getServerAccount(requestHeaders),
  ]);

  if (!account?.user) {
    redirect("/login");
  }

  if (isPhotographerPendingReview(onboarding)) {
    return <PhotographerOnboardingUnderReview />;
  }

  const availableSpecialities = await specialityDal.getAll();
  const pageTitle = "Portfolio";
  const pageSubtitle =
    "All photographer details are shown together here in read-only mode.";
  const status = getStatusDetails(onboarding);
  const specialityNameById = new Map(
    availableSpecialities.map((speciality) => [speciality.id, speciality.name]),
  );
  const specialityItems = onboarding.specialities.map((speciality) => ({
    id: speciality.specialityId,
    name:
      specialityNameById.get(speciality.specialityId) ?? "Unknown speciality",
    startingPrice: speciality.startingPrice,
  }));
  const contactDetails = onboarding.contact
    ? {
        email: onboarding.contact.email,
        emailVerification: onboarding.contact.emailVerified
          ? "Verified"
          : "Not verified",
        phone: onboarding.contact.phone,
        visibility: onboarding.contact.isPublic
          ? "Shown on the public profile"
          : "Hidden from the public profile",
      }
    : null;

  return (
    <div className="space-y-8">
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-muted text-xl font-semibold text-foreground/80">
                {onboarding.avatar ? (
                  <>
                    {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
                    <img
                      src={onboarding.avatar}
                      alt={onboarding.name ?? "Photographer avatar"}
                      className="h-full w-full object-cover"
                    />
                  </>
                ) : (
                  getProfileInitials(onboarding.name)
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{onboarding.name ?? "Your photographer profile"}</CardTitle>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <CardDescription>{status.description}</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6 md:grid-cols-2">
          <ReadOnlyField
            label="Bio"
            value={
              onboarding.bio?.trim()
                ? onboarding.bio
                : "No bio has been added yet."
            }
          />
          <ReadOnlyField
            label="City"
            value={onboarding.locationCity ?? "Not added yet"}
          />
          <ReadOnlyField
            label="Country"
            value={onboarding.locationCountry || "india"}
          />
          <ReadOnlyField
            label="Experience"
            value={getExperienceLabel(onboarding.experienceYears)}
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
          {contactDetails ? (
            <>
              <ReadOnlyField label="Phone" value={contactDetails.phone} />
              <ReadOnlyField label="Email" value={contactDetails.email} />
              <ReadOnlyField
                label="Email status"
                value={contactDetails.emailVerification}
              />
              <ReadOnlyField
                label="Visibility"
                value={contactDetails.visibility}
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
          <CardTitle>Specialities</CardTitle>
          <CardDescription>
            Services and starting prices currently attached to this portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {specialityItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No specialities have been added yet.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2.5">
              {specialityItems.map((speciality) => (
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

      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Portfolio images
          </h2>
          <p className="text-sm text-muted-foreground">
            Every portfolio image currently linked to this photographer profile.
          </p>
        </div>

        {onboarding.uploads.length === 0 ? (
          <div className="rounded-4xl border border-dashed border-border/70 bg-muted/20 px-6 py-8 text-sm text-muted-foreground">
            No portfolio images have been added yet.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {onboarding.uploads.map((upload, index) => (
              <Card
                key={`${upload.imageUrl}-${index}`}
                className="border border-border/70 shadow-sm"
              >
                <CardContent className="p-0">
                  <div className="aspect-[4/3] overflow-hidden">
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
}
