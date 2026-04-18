import { headers } from "next/headers";
import { PhotographerOfferingsForm } from "@/components/forms/photographer/offerings";
import PageHeader from "@/components/page-header";
import { specialityDal } from "@/server/db/dal/speciality";
import { getApprovedPhotographerPanelData } from "@/server/services/photographer-panel";

export default async function PhotographerOfferingsPage() {
  const requestHeaders = await headers();
  const [{ onboarding }, availableSpecialities] = await Promise.all([
    getApprovedPhotographerPanelData(requestHeaders),
    specialityDal.getAll(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Offerings"
        subtitle="Manage the specialities and starting prices shown on your photographer profile."
      />

      <div className="max-w-4xl">
        <PhotographerOfferingsForm
          availableSpecialities={availableSpecialities.map((speciality) => ({
            id: speciality.id,
            name: speciality.name,
          }))}
          onboarding={onboarding}
        />
      </div>
    </div>
  );
}
