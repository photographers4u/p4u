import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

const reviewDecisionStatuses = ["approved", "rejected", "on_hold"] as const;

export type PhotographerReviewDecisionStatus =
  (typeof reviewDecisionStatuses)[number];

type PhotographerWorkflowState = {
  status: PhotographerWorkflowStatus | null | undefined;
};

export function isApprovedPhotographer(state: PhotographerWorkflowState) {
  return state.status === "approved";
}

export function isPhotographerSubmittedForReview(
  state: PhotographerWorkflowState,
) {
  return state.status === "submitted";
}

type PhotographerModerationState = PhotographerWorkflowState;

export function getAllowedPhotographerReviewStatuses(
  state: PhotographerModerationState,
): PhotographerReviewDecisionStatus[] {
  if (isPhotographerSubmittedForReview(state)) {
    return ["approved", "rejected"];
  }

  if (state.status === "on_hold") {
    return ["approved", "on_hold"];
  }

  if (state.status === "rejected") {
    return ["approved", "rejected"];
  }

  if (isApprovedPhotographer(state)) {
    return ["on_hold"];
  }

  return [];
}

export function canReviewPhotographerWithStatus(
  state: PhotographerModerationState,
  nextStatus: PhotographerReviewDecisionStatus,
) {
  return getAllowedPhotographerReviewStatuses(state).includes(nextStatus);
}
