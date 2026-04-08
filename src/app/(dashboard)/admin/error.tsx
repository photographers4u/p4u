"use client";

import { InternalServerState } from "@/components/internal-server-state";
import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <InternalServerState
        description="Something went wrong while loading the admin area."
        href="/dashboard/items"
        actionLabel="Back to dashboard"
      />
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}