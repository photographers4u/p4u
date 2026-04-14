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
import { specialityDal } from "@/server/db/dal/speciality";

export default async function PhotographerOfferingsPage() {
  const requestHeaders = await headers();
  const [{ onboarding }, availableSpecialities] = await Promise.all([
    getApprovedPhotographerPanelData(requestHeaders),
    specialityDal.getAll(),
  ]);

  const specialityNameById = new Map(
    availableSpecialities.map((speciality) => [speciality.id, speciality.name]),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Offerings"
        subtitle="Specialities and starting prices currently attached to your photographer profile."
      />

      {onboarding.specialities.length === 0 ? (
        <Card className="border border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>No offerings added</CardTitle>
            <CardDescription>
              Your photographer profile does not have any active speciality
              pricing yet.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="border border-border/70 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Current offerings</CardTitle>
            <CardDescription>
              These starting prices come from the approved photographer profile
              now linked to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y px-0">
            {onboarding.specialities.map((speciality) => (
              <div
                key={speciality.specialityId}
                className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {specialityNameById.get(speciality.specialityId) ??
                      "Unknown speciality"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Speciality pricing shown to clients
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground">
                  From Rs. {speciality.startingPrice}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
