import {
  isApprovedPhotographer,
  isPendingVerificationPhotographer,
  isPhotographerSubmittedForReview,
} from "@/lib/photographer-status";
import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

type PhotographerStatusBadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline";

type PhotographerStatusState = {
  isPublished?: boolean;
  rejectionReason?: string | null;
  status: PhotographerWorkflowStatus | null | undefined;
};

export type PhotographerPortfolioBanner = {
  description: string;
  message: string;
  tone: "danger" | "info" | "warning";
};

export type PhotographerStatusViewModel = {
  adminDescription: string;
  badgeVariant: PhotographerStatusBadgeVariant;
  canEditApprovedProfile: boolean;
  canManageOfferings: boolean;
  isApproved: boolean;
  isDraft: boolean;
  isOnHold: boolean;
  isPendingVerification: boolean;
  isRejected: boolean;
  isSubmittedForReview: boolean;
  label: string;
  portfolioBanner: PhotographerPortfolioBanner | null;
  shouldRedirectOnboardingToPortfolio: boolean;
  shouldRedirectPortfolioToOnboarding: boolean;
  shouldShowPortfolioForms: boolean;
};

function normalizePhotographerStatus(
  status: PhotographerWorkflowStatus | null | undefined,
): PhotographerWorkflowStatus {
  return status ?? "draft";
}

export function getPhotographerStatusViewModel(
  state: PhotographerStatusState | null | undefined,
): PhotographerStatusViewModel {
  const status = normalizePhotographerStatus(state?.status);
  const isApproved = isApprovedPhotographer({ status });
  const isSubmittedForReview = isPhotographerSubmittedForReview({ status });
  const isRejected = status === "rejected";
  const isOnHold = status === "on_hold";
  const isDraft = status === "draft";
  const isPendingVerification = isPendingVerificationPhotographer({ status });
  const isPublished = state?.isPublished ?? false;
  const rejectionReason = state?.rejectionReason?.trim() ?? "";
  const portfolioBanner = isPendingVerification
    ? {
        tone: "info" as const,
        message: "Your profile is live with a pending verification badge.",
        description:
          "Our team will call you to confirm permission before switching it to a verified badge.",
      }
    : isSubmittedForReview
      ? {
          tone: "info" as const,
          message: "Your profile has been submitted for review.",
          description:
            "It is hidden from visitors right now and will go live after approval.",
        }
      : isRejected
        ? {
            tone: "danger" as const,
            message: "Your profile has been rejected.",
            description:
              rejectionReason || "It is not visible to visitors right now.",
          }
        : isOnHold
          ? {
              tone: "warning" as const,
              message: "Your profile is on hold.",
              description:
                rejectionReason ||
                "It is currently hidden from visitors on the public page.",
            }
          : null;

  if (isApproved) {
    return {
      adminDescription: isPublished
        ? "Approved and currently visible in the public photographer directory."
        : "Approved, but not currently visible in the public directory.",
      badgeVariant: "default",
      canEditApprovedProfile: true,
      canManageOfferings: true,
      isApproved,
      isDraft,
      isOnHold,
      isPendingVerification,
      isRejected,
      isSubmittedForReview,
      label: "Approved",
      portfolioBanner,
      shouldRedirectOnboardingToPortfolio: true,
      shouldRedirectPortfolioToOnboarding: false,
      shouldShowPortfolioForms: true,
    };
  }

  if (isOnHold) {
    return {
      adminDescription:
        "This photographer profile was previously live and is currently on hold.",
      badgeVariant: "destructive",
      canEditApprovedProfile: false,
      canManageOfferings: false,
      isApproved,
      isDraft,
      isOnHold,
      isPendingVerification,
      isRejected,
      isSubmittedForReview,
      label: "On hold",
      portfolioBanner,
      shouldRedirectOnboardingToPortfolio: true,
      shouldRedirectPortfolioToOnboarding: false,
      shouldShowPortfolioForms: true,
    };
  }

  if (isRejected) {
    return {
      adminDescription:
        "This photographer profile was rejected before it could go live.",
      badgeVariant: "destructive",
      canEditApprovedProfile: false,
      canManageOfferings: false,
      isApproved,
      isDraft,
      isOnHold,
      isPendingVerification,
      isRejected,
      isSubmittedForReview,
      label: "Rejected",
      portfolioBanner,
      shouldRedirectOnboardingToPortfolio: true,
      shouldRedirectPortfolioToOnboarding: false,
      shouldShowPortfolioForms: true,
    };
  }

  if (isSubmittedForReview) {
    return {
      adminDescription:
        "This photographer profile has been submitted and is waiting for review.",
      badgeVariant: "secondary",
      canEditApprovedProfile: false,
      canManageOfferings: false,
      isApproved,
      isDraft,
      isOnHold,
      isPendingVerification,
      isRejected,
      isSubmittedForReview,
      label: "Submitted",
      portfolioBanner,
      shouldRedirectOnboardingToPortfolio: true,
      shouldRedirectPortfolioToOnboarding: false,
      shouldShowPortfolioForms: true,
    };
  }

  if (isPendingVerification) {
    return {
      adminDescription:
        "Imported photographer profile, live publicly, awaiting a verification call before approval.",
      badgeVariant: "secondary",
      canEditApprovedProfile: false,
      canManageOfferings: false,
      isApproved,
      isDraft,
      isOnHold,
      isPendingVerification,
      isRejected,
      isSubmittedForReview,
      label: "Pending Verification & Permission",
      portfolioBanner,
      shouldRedirectOnboardingToPortfolio: true,
      shouldRedirectPortfolioToOnboarding: false,
      shouldShowPortfolioForms: true,
    };
  }

  return {
    adminDescription: "This photographer profile is still in draft mode.",
    badgeVariant: "outline",
    canEditApprovedProfile: false,
    canManageOfferings: false,
    isApproved,
    isDraft,
    isOnHold,
    isPendingVerification,
    isRejected,
    isSubmittedForReview,
    label: "Draft",
    portfolioBanner,
    shouldRedirectOnboardingToPortfolio: false,
    shouldRedirectPortfolioToOnboarding: true,
    shouldShowPortfolioForms: false,
  };
}

export function getProfileInitials(name: string | null) {
  if (!name?.trim()) {
    return "P";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function formatPhotographerExperience(experienceYears: string | null) {
  if (!experienceYears) {
    return "Not added yet";
  }

  return experienceYears === "1"
    ? "1 year exp."
    : `${experienceYears} years exp.`;
}

export function formatPhotographerCountry(country: string | null | undefined) {
  if (!country?.trim()) {
    return "Not added yet";
  }

  return `${country.charAt(0).toUpperCase()}${country.slice(1)}`;
}
