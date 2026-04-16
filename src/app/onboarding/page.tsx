import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CreatePhotographerForm } from "@/components/forms/create-photographer-form";
import PageHeader from "@/components/page-header";
import {
  getServerAccount,
  getServerPhotographer,
  getServerPhotographerOnboarding,
} from "@/lib/server-api";
import {
  isApprovedPhotographer,
  isPhotographerPendingReview,
} from "@/lib/photographer-status";
import { specialityDal } from "@/server/db/dal/speciality";

export default async function OnboardingPage() {
  const requestHeaders = await headers();
  const [account, photographer, onboarding, availableSpecialities] =
    await Promise.all([
      getServerAccount(requestHeaders),
      getServerPhotographer(requestHeaders),
      getServerPhotographerOnboarding(requestHeaders),
      specialityDal.getAll(),
    ]);

  if (!account?.user || !onboarding) {
    redirect("/login");
  }

  if (
    (photographer && isApprovedPhotographer(photographer)) ||
    photographer?.status === "rejected" ||
    photographer?.status === "on_hold" ||
    isPhotographerPendingReview(onboarding)
  ) {
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
          availableSpecialities={availableSpecialities.map((speciality) => ({
            id: speciality.id,
            name: speciality.name,
          }))}
          defaultEmail={defaultEmail}
          initialData={onboarding}
        />
      </div>
    </div>
  );
}
