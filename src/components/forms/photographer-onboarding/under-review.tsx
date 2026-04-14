import PageHeader from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function PhotographerOnboardingUnderReview() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Your application is under review"
        subtitle="Your photographer profile has been submitted successfully."
      />

      <Card className="border border-border/70 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Pending</Badge>
            <CardTitle>It will be reviewed soon</CardTitle>
          </div>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Our team will review your profile details soon and update you once
            the next step is ready.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
