import { headers } from "next/headers";
import PageHeader from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApprovedPhotographerPanelData } from "@/lib/photographer-panel";

export default async function PhotographerImagesPage() {
  const { onboarding } = await getApprovedPhotographerPanelData(await headers());

  return (
    <div className="space-y-8">
      <PageHeader
        title="Images"
        subtitle="Portfolio images connected to your photographer profile."
      />

      {onboarding.uploads.length === 0 ? (
        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No images yet</CardTitle>
            <CardDescription>
              Once portfolio uploads are added to your approved photographer
              profile, they&apos;ll appear here.
            </CardDescription>
          </CardHeader>
        </Card>
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
  );
}
