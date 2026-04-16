import { ONBOARDING_STEPS } from "@/zod/helpers";

const reviewDecisionStatuses = ["approved", "rejected", "on_hold"] as const;

export type PhotographerReviewDecisionStatus =
  (typeof reviewDecisionStatuses)[number];

type PhotographerPublicationState = {
  isPublished: boolean;
  status: string | null | undefined;
};

type PhotographerReviewState = {
  contact: unknown;
  onboardingStep: number;
  status: string | null | undefined;
};

export function isApprovedPhotographer(
  state: PhotographerPublicationState,
) {
  return state.status === "approved" || state.isPublished;
}

export function isPhotographerPendingReview(
  state: PhotographerReviewState,
) {
  return (
    state.status === "pending" &&
    state.onboardingStep === ONBOARDING_STEPS[3] &&
    Boolean(state.contact)
  );
}

type PhotographerModerationState = PhotographerPublicationState &
  PhotographerReviewState;

export function getAllowedPhotographerReviewStatuses(
  state: PhotographerModerationState,
): PhotographerReviewDecisionStatus[] {
  if (isPhotographerPendingReview(state)) {
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
