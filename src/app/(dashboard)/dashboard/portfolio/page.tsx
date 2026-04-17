import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PhotographerContactUpdateForm } from "@/components/forms/photographer/contact";
import { PhotographerOfferingsForm } from "@/components/forms/photographer/offerings";
import { PhotographerProfileUpdateForm } from "@/components/forms/photographer/profile";
import PageHeader from "@/components/page-header";
import {
  isApprovedPhotographer,
  isPhotographerSubmittedForReview,
} from "@/lib/photographer-status";
import {
  getServerPhotographer,
  getServerPhotographerContact,
  getServerPhotographerOnboarding,
} from "@/lib/server-api";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { specialityDal } from "@/server/db/dal/speciality";
import type { Photographer } from "@/zod/schema";

type PortfolioBanner = {
  description: string;
  message: string;
  tone: "danger" | "info" | "warning";
};

function getPortfolioBanner(
  photographer: Photographer,
): PortfolioBanner | null {
  if (photographer.status === "submitted") {
    return {
      tone: "info",
      message: "Your profile has been submitted for review.",
      description:
        "It is hidden from visitors right now and will go live after approval.",
    };
  }

  if (photographer.status === "rejected") {
    return {
      tone: "danger",
      message: "Your profile has been rejected.",
      description:
        photographer.rejectionReason?.trim() ||
        "It is not visible to visitors right now.",
    };
  }

  if (photographer.status === "on_hold") {
    return {
      tone: "warning",
      message: "Your profile is on hold.",
      description:
        photographer.rejectionReason?.trim() ||
        "It is currently hidden from visitors on the public page.",
    };
  }

  return null;
}

function PortfolioStatusBanner({ banner }: { banner: PortfolioBanner }) {
  return (
    <div
      className={cn(
        "absolute w-full inset-0 h-fit border-b px-4 py-3 text-sm",
        banner.tone === "info" && "border-sky-300 bg-sky-50 text-sky-950",
        banner.tone === "warning" &&
          "border-orange-300 bg-orange-50 text-orange-950",
        banner.tone === "danger" && "border-red-300 bg-red-50 text-red-950",
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        <p className="font-semibold">{banner.message}</p>
        <p className="mt-1 opacity-90">{banner.description}</p>
      </div>
    </div>
  );
}

function ContactSection({
  canSubmit,
  contact,
}: {
  canSubmit: boolean;
  contact: Awaited<ReturnType<typeof getServerPhotographerContact>>;
}) {
  if (!contact) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Contact Information</h2>
        <p className="text-sm text-muted-foreground">
          Update the details clients will use to reach you.
        </p>
      </div>

      <PhotographerContactUpdateForm canSubmit={canSubmit} contact={contact} />
    </section>
  );
}

function OfferingsSection({
  availableSpecialities,
  canSubmit,
  onboarding,
}: {
  availableSpecialities: Array<{
    id: string;
    name: string;
  }>;
  canSubmit: boolean;
  onboarding: Awaited<ReturnType<typeof getServerPhotographerOnboarding>>;
}) {
  if (!onboarding) {
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Offerings</h2>
        <p className="text-sm text-muted-foreground">
          Manage the specialities and starting prices shown on your photographer
          profile.
        </p>
      </div>

      <PhotographerOfferingsForm
        availableSpecialities={availableSpecialities}
        canSubmit={canSubmit}
        onboarding={onboarding}
      />
    </section>
  );
}

export default async function PortfolioPage() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    redirect("/login");
  }

  const photographer = await getServerPhotographer(requestHeaders);

  if (!photographer) {
    redirect("/onboarding");
  }

  const [onboarding, contact] = await Promise.all([
    getServerPhotographerOnboarding(requestHeaders),
    getServerPhotographerContact(requestHeaders),
  ]);

  const isApproved = isApprovedPhotographer(photographer);
  const isSubmittedForReview = isPhotographerSubmittedForReview(photographer);
  const shouldShowReviewForms =
    photographer.status === "on_hold" ||
    photographer.status === "rejected" ||
    isSubmittedForReview;

  if (photographer.status === "draft") {
    redirect("/onboarding");
  }

  if ((isApproved || shouldShowReviewForms) && !onboarding) {
    redirect("/onboarding");
  }

  const availableSpecialities = shouldShowReviewForms
    ? await specialityDal.getAll()
    : [];
  const banner = getPortfolioBanner(photographer);
  const canEditProfile = isApproved;
  const shouldShowForms = isApproved || shouldShowReviewForms;

  return (
    <div className="space-y-8">
      {banner ? <PortfolioStatusBanner banner={banner} /> : null}

      <PageHeader
        className={isApproved ? "" : "mt-10"}
        title="Photographer Profile"
        subtitle="Control how you appear to visitors."
      />

      {shouldShowForms ? (
        <div className="max-w-3xl space-y-12">
          <PhotographerProfileUpdateForm
            canSubmit={canEditProfile}
            profile={photographer}
          />
          <ContactSection canSubmit={canEditProfile} contact={contact} />
          {shouldShowReviewForms ? (
            <OfferingsSection
              availableSpecialities={availableSpecialities.map(
                (speciality) => ({
                  id: speciality.id,
                  name: speciality.name,
                }),
              )}
              canSubmit={canEditProfile}
              onboarding={onboarding}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
