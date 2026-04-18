import { headers } from "next/headers";
import PageHeader from "@/components/page-header";
import { PhotographerImagesManager } from "@/components/dashboard/photographer-images-manager";
import { getApprovedPhotographerPanelData } from "@/server/services/photographer-panel";

export default async function PhotographerImagesPage() {
  const { onboarding } = await getApprovedPhotographerPanelData(
    await headers(),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Images"
        subtitle="Upload your portfolio images."
      />

      <PhotographerImagesManager initialUploads={onboarding.uploads} />
    </div>
  );
}
