"use client";

import type { Route } from "next";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import type { PhotographerReviewDecisionStatus } from "@/lib/photographer-status";
import type { ReviewPhotographerInput } from "@/zod/schema/photographer";
import { ReviewDecisionActions } from "./review-decision-actions";

export function AdminPhotographerReviewActions({
  allowedTransitions,
  photographerId,
  currentStatus,
  returnTo,
}: {
  allowedTransitions: PhotographerReviewDecisionStatus[];
  photographerId: string;
  currentStatus:
    | "draft"
    | "submitted"
    | "approved"
    | "rejected"
    | "on_hold"
    | "pending_verification";
  returnTo?: string;
}) {
  const successHref = returnTo
    ? (`/admin/photographer/${photographerId}?${new URLSearchParams({
        returnTo,
      }).toString()}` as Route)
    : (`/admin/photographer/${photographerId}` as Route);

  return (
    <ReviewDecisionActions
      allowedTransitions={allowedTransitions}
      id={photographerId}
      entityLabel="Photographer"
      approveLabel="Approve photographer"
      rejectLabel="Reject photographer"
      approvingLabel="Approving..."
      rejectingLabel="Rejecting..."
      currentStatus={currentStatus}
      successHref={successHref}
      submitReview={async ({ id, data }) => {
        const response = await apiClient.photographer[":id"].review.$patch({
          param: { id },
          json: data as ReviewPhotographerInput,
        });
        const { errorMessage } = await readApiResponse(response);

        if (!response.ok) {
          return {
            ok: false as const,
            status: response.status,
            error: errorMessage ?? "We couldn't save the review decision.",
          };
        }

        return { ok: true as const };
      }}
    />
  );
}
