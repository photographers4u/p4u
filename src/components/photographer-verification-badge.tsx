import { BadgeCheck, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

export function PhotographerVerificationBadge({
  status,
  className,
}: {
  status: PhotographerWorkflowStatus | null | undefined;
  className?: string;
}) {
  if (status === "approved") {
    return (
      <Badge variant="default" className={className}>
        <BadgeCheck className="size-3" />
        Verified
      </Badge>
    );
  }

  if (status === "pending_verification") {
    return (
      <Badge variant="secondary" className={className}>
        <Clock3 className="size-3" />
        Pending Verification & Permission
      </Badge>
    );
  }

  return null;
}
