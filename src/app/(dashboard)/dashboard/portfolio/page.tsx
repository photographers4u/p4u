import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PhotographerContactUpdateForm } from "@/components/forms/photographer/contact";
import { PhotographerOfferingsForm } from "@/components/forms/photographer/offerings";
import { PhotographerProfileUpdateForm } from "@/components/forms/photographer/profile";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  getPhotographerStatusViewModel,
  type PhotographerPortfolioBanner,
} from "@/lib/photographer-presentation";
import { cn } from "@/lib/utils";
import { getAuthSession } from "@/server/auth/session";
import { NotFoundError } from "@/server/db/helpers/errors";
import { getPhotographerPortfolioByUserId } from "@/server/services/photographer";
import {
  getSpecialityFormOptions,
  type SpecialityFormOption,
} from "@/server/services/speciality";

type PortfolioSnapshot = Awaited<
  ReturnType<typeof getPhotographerPortfolioByUserId>
>;

type OnboardingSnapshot = NonNullable<PortfolioSnapshot["onboarding"]>;
type SubmittedReviewUpload = OnboardingSnapshot["uploads"][number];

async function getPortfolioForCurrentUser() {
  const requestHeaders = await headers();
  const session = await getAuthSession({ headers: requestHeaders });

  if (!session?.user) {
    redirect("/login");
  }

  try {
    return await getPhotographerPortfolioByUserId(session.user.id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      redirect("/onboarding");
    }

    throw error;
  }
}

function SectionHeader({
  description,
  title,
}: {
  description?: string;
  title: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </h2>

      {description ? (
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function PortfolioStatusBanner({
  banner,
}: {
  banner: PhotographerPortfolioBanner;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 h-fit w-full border-b px-4 py-3 text-sm",
        banner.tone === "info" && "border-sky-300 bg-sky-50 text-sky-950",
        banner.tone === "warning" &&
          "border-orange-300 bg-orange-50 text-orange-950",
        banner.tone === "danger" && "border-red-300 bg-red-50 text-red-950",
      )}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <p className="font-semibold">{banner.message}</p>
        <p className="mt-1 opacity-90">{banner.description}</p>
      </div>
    </div>
  );
}

function PublicListingBanner({
  slug,
}: {
  slug: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-emerald-950">
          Your public listing is live.
        </p>

        <p className="text-sm text-emerald-800">
          Visitors can view your profile at{" "}
          <span className="font-medium">{`/p/${slug}`}</span>.
        </p>
      </div>

      <Button asChild variant="outline" className="border-emerald-300">
        <Link href={`/p/${slug}`} target="_blank">
          View public profile
        </Link>
      </Button>
    </div>
  );
}

function ProfileSection({
  canSubmit,
  photographer,
}: {
  canSubmit: boolean;
  photographer: PortfolioSnapshot["photographer"];
}) {
  return (
    <PhotographerProfileUpdateForm
      canSubmit={canSubmit}
      profile={photographer}
    />
  );
}

function ContactSection({
  canSubmit,
  contact,
}: {
  canSubmit: boolean;
  contact: PortfolioSnapshot["contact"];
}) {
  if (!contact) {
    return null;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Contact Information"
        description="Update the details clients will use to reach you."
      />

      <PhotographerContactUpdateForm canSubmit={canSubmit} contact={contact} />
    </section>
  );
}

function OfferingsSection({
  availableSpecialities,
  canSubmit,
  onboarding,
}: {
  availableSpecialities: SpecialityFormOption[];
  canSubmit: boolean;
  onboarding: PortfolioSnapshot["onboarding"];
}) {
  if (!onboarding) {
    return null;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Offerings"
        description="Manage the specialities and starting prices shown on your profile."
      />

      <PhotographerOfferingsForm
        availableSpecialities={availableSpecialities}
        canSubmit={canSubmit}
        onboarding={onboarding}
      />
    </section>
  );
}

function SubmittedReviewPhoto({
  index,
  upload,
}: {
  index: number;
  upload: SubmittedReviewUpload;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border bg-muted/10">
      <div className="aspect-square overflow-hidden bg-muted/15">
        {/* biome-ignore lint/performance/noImgElement: uploaded assets are stored on an external host */}
        <img
          src={upload.imageUrl}
          alt={`Submitted review sample ${index + 1}`}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>
    </div>
  );
}

function SubmittedReviewPhotosSection({
  uploads,
}: {
  uploads: SubmittedReviewUpload[];
}) {
  if (uploads.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionHeader
        title="Submitted review photos"
        description="These are the photos currently waiting for admin review."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {uploads.map((upload, index) => (
          <SubmittedReviewPhoto
            key={upload.id}
            upload={upload}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

function EditablePortfolioSections({
  availableSpecialities,
  canEditProfile,
  contact,
  photographer,
  shouldShowOfferings,
  onboarding,
}: {
  availableSpecialities: SpecialityFormOption[];
  canEditProfile: boolean;
  contact: PortfolioSnapshot["contact"];
  photographer: PortfolioSnapshot["photographer"];
  shouldShowOfferings: boolean;
  onboarding: PortfolioSnapshot["onboarding"];
}) {
  return (
    <div className="max-w-3xl space-y-12">
      <ProfileSection canSubmit={canEditProfile} photographer={photographer} />

      <ContactSection canSubmit={canEditProfile} contact={contact} />

      {shouldShowOfferings ? (
        <OfferingsSection
          availableSpecialities={availableSpecialities}
          canSubmit={canEditProfile}
          onboarding={onboarding}
        />
      ) : null}
    </div>
  );
}

export default async function PortfolioPage() {
  const portfolio = await getPortfolioForCurrentUser();

  const { contact, onboarding, photographer } = portfolio;
  const photographerStatus = getPhotographerStatusViewModel(photographer);

  if (photographerStatus.shouldRedirectPortfolioToOnboarding) {
    redirect("/onboarding");
  }

  if (photographerStatus.shouldShowPortfolioForms && !onboarding) {
    redirect("/onboarding");
  }

  const canEditProfile = photographerStatus.canEditApprovedProfile;
  const shouldShowForms = photographerStatus.shouldShowPortfolioForms;
  const shouldShowOfferings = shouldShowForms && !canEditProfile && !!onboarding;
  const shouldShowPublicListing =
    photographerStatus.isApproved && photographer.isPublished && photographer.slug;

  const submittedReviewUploads =
    photographerStatus.isSubmittedForReview && onboarding
      ? onboarding.uploads
      : [];

  const availableSpecialities = shouldShowOfferings
    ? await getSpecialityFormOptions()
    : [];

  return (
    <div className="space-y-8">
      {photographerStatus.portfolioBanner ? (
        <PortfolioStatusBanner banner={photographerStatus.portfolioBanner} />
      ) : null}

      <PageHeader
        className={photographerStatus.isApproved ? "" : "mt-10"}
        title="Photographer Profile"
        subtitle="Control how you appear to visitors."
      />

      {shouldShowPublicListing ? (
        <PublicListingBanner slug={photographer.slug as string} />
      ) : null}

      {shouldShowForms ? (
        <EditablePortfolioSections
          availableSpecialities={availableSpecialities}
          canEditProfile={canEditProfile}
          contact={contact}
          photographer={photographer}
          shouldShowOfferings={shouldShowOfferings}
          onboarding={onboarding}
        />
      ) : null}

      <SubmittedReviewPhotosSection uploads={submittedReviewUploads} />
    </div>
  );
}