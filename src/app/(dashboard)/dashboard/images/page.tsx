import { headers } from "next/headers";
import { PhotographerImagesManager } from "@/components/dashboard/photographer-images-manager";
import PageHeader from "@/components/page-header";
import { getApprovedPhotographerPanelData } from "@/server/services/photographer-panel";

export default async function PhotographerImagesPage() {
  const { onboarding } = await getApprovedPhotographerPanelData(
    await headers(),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Images"
        subtitle="Upload your portfolio images and pin up to 5 so they show first across your profile."
      />

      <PhotographerImagesManager initialUploads={onboarding.uploads} />
    </div>
  );
}
