import type { PhotographerOnboardingState } from "@/zod/schema/photographer";

type PhotographerPublicationState = {
  isPublished: boolean;
  status: string | null | undefined;
};

export function isApprovedPhotographer(
  state: PhotographerPublicationState,
) {
  return state.status === "approved" || state.isPublished;
}

export function isPhotographerPendingReview(
  state: Pick<PhotographerOnboardingState, "contact" | "status">,
) {
  return state.status === "pending" && Boolean(state.contact);
}
