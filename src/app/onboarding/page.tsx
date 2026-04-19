import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatePhotographerForm } from "@/components/forms/create-photographer-form";
import PageHeader from "@/components/page-header";
import { getPhotographerStatusViewModel } from "@/lib/photographer-presentation";
import { getAccountOverview } from "@/server/services/account";
import { getCurrentPhotographerOnboarding } from "@/server/services/photographer";
import { getSpecialityFormOptions } from "@/server/services/speciality";

export default async function OnboardingPage() {
  const requestHeaders = await headers();
  const [account, onboarding, availableSpecialities] = await Promise.all([
    getAccountOverview(requestHeaders),
    getCurrentPhotographerOnboarding(requestHeaders),
    getSpecialityFormOptions(),
  ]);

  if (!account?.user || !onboarding) {
    redirect("/login");
  }

  const photographerStatus = getPhotographerStatusViewModel(onboarding);

  if (photographerStatus.shouldRedirectOnboardingToPortfolio) {
    redirect("/dashboard/portfolio");
  }

  const defaultEmail = account.pendingEmail ?? account.user.email ?? "";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Photographer Onboarding"
        subtitle="Complete your profile, upload your avatar, add your specialities, and submit your details for review."
      />

      <div className="max-w-4xl">
        <CreatePhotographerForm
          availableSpecialities={availableSpecialities}
          defaultEmail={defaultEmail}
          initialData={onboarding}
        />
      </div>
    </div>
  );
}
