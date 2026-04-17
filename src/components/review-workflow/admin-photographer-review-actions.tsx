"use client";

import type { Route } from "next";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import type { PhotographerReviewDecisionStatus } from "@/lib/photographer-status";
import type { ReviewPhotographerInput } from "@/zod/schema/photographer";
import { ReviewDecisionActions } from "./review-decision-actions";

export function AdminPhotographerReviewActions({
  allowedTransitions,
  photographerId,
  currentStatus,
}: {
  allowedTransitions: PhotographerReviewDecisionStatus[];
  photographerId: string;
  currentStatus: "draft" | "submitted" | "approved" | "rejected" | "on_hold";
}) {
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
      successHref={`/admin/photographer/${photographerId}` as Route}
      submitReview={async ({ id, data }) => {
        const response = await apiClient.photographer[":id"].review.$patch({
          param: { id },
          json: data as ReviewPhotographerInput,
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          return {
            ok: false as const,
            status: response.status,
            error:
              getApiErrorMessage(payload) ??
              "We couldn't save the review decision.",
          };
        }

        return { ok: true as const };
      }}
    />
  );
}
