import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PhotographerContactUpdateForm } from "@/components/forms/photographer/contact";
import { PhotographerOfferingsForm } from "@/components/forms/photographer/offerings";
import { PhotographerProfileUpdateForm } from "@/components/forms/photographer/profile";
import PageHeader from "@/components/page-header";
import {
  getPhotographerStatusViewModel,
  type PhotographerPortfolioBanner,
} from "@/lib/photographer-presentation";
import { cn } from "@/lib/utils";
import { getAuthSession } from "@/server/auth/session";
import { specialityDal } from "@/server/db/dal/speciality";
import {
  getCurrentPhotographer,
  getCurrentPhotographerContact,
  getCurrentPhotographerOnboarding,
} from "@/server/services/photographer";

function PortfolioStatusBanner({
  banner,
}: {
  banner: PhotographerPortfolioBanner;
}) {
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
  contact: Awaited<ReturnType<typeof getCurrentPhotographerContact>>;
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
  onboarding: Awaited<ReturnType<typeof getCurrentPhotographerOnboarding>>;
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
  const session = await getAuthSession({ headers: requestHeaders });

  if (!session?.user) {
    redirect("/login");
  }

  const photographer = await getCurrentPhotographer(requestHeaders);

  if (!photographer) {
    redirect("/onboarding");
  }

  const [onboarding, contact] = await Promise.all([
    getCurrentPhotographerOnboarding(requestHeaders),
    getCurrentPhotographerContact(requestHeaders),
  ]);
  const photographerStatus = getPhotographerStatusViewModel(photographer);

  if (photographerStatus.shouldRedirectPortfolioToOnboarding) {
    redirect("/onboarding");
  }

  if (photographerStatus.shouldShowPortfolioForms && !onboarding) {
    redirect("/onboarding");
  }

  const availableSpecialities = !photographerStatus.canEditApprovedProfile
    ? await specialityDal.getAll()
    : [];
  const canEditProfile = photographerStatus.canEditApprovedProfile;
  const shouldShowForms = photographerStatus.shouldShowPortfolioForms;

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

      {shouldShowForms ? (
        <div className="max-w-3xl space-y-12">
          <PhotographerProfileUpdateForm
            canSubmit={canEditProfile}
            profile={photographer}
          />
          <ContactSection canSubmit={canEditProfile} contact={contact} />
          {!photographerStatus.canEditApprovedProfile ? (
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
