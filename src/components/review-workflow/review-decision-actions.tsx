"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/field";
import type { PhotographerReviewDecisionStatus } from "@/lib/photographer-status";

export function ReviewDecisionActions({
  allowedTransitions,
  id,
  entityLabel,
  approveLabel,
  rejectLabel,
  approvingLabel,
  rejectingLabel,
  successHref,
  currentStatus,
  submitReview,
}: {
  allowedTransitions: PhotographerReviewDecisionStatus[];
  id: string;
  entityLabel: string;
  approveLabel: string;
  rejectLabel: string;
  approvingLabel: string;
  rejectingLabel: string;
  successHref: Route;
  currentStatus?: "draft" | "submitted" | "approved" | "rejected" | "on_hold";
  submitReview: (input: {
    id: string;
    data:
      | { status: "approved"; rejectionReason?: null }
      | { status: "rejected"; rejectionReason: string }
      | { status: "on_hold"; rejectionReason: string };
  }) => Promise<
    | { ok: true }
    | {
        ok: false;
        status: number;
        error: string;
      }
  >;
}) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  const [rejectSuccess, setRejectSuccess] = useState(false);
  const [showRejectReason, setShowRejectReason] = useState(false);

  const reviewStatus = currentStatus ?? "draft";
  const canApprove = allowedTransitions.includes("approved");
  const isAlreadyApproved = reviewStatus === "approved";
  const isCurrentlyRejected = reviewStatus === "rejected";
  const isCurrentlyOnHold = reviewStatus === "on_hold";
  const nextReasonStatus = allowedTransitions.includes("on_hold")
    ? "on_hold"
    : allowedTransitions.includes("rejected")
      ? "rejected"
      : null;
  const isHoldFlow = nextReasonStatus === "on_hold";
  const isBusy = isApproving || isRejecting;
  const normalizedEntityLabel = entityLabel.toLowerCase();

  const approveActionCopy = isCurrentlyOnHold
    ? {
        busy: "Releasing...",
        idle: `Release ${normalizedEntityLabel}`,
        success: "Released!",
      }
    : {
        busy: approvingLabel,
        idle: approveLabel,
        success: "Approved!",
      };

  const rejectActionCopy = isHoldFlow
    ? isCurrentlyOnHold
      ? {
          busy: "Saving hold reason...",
          error: `A hold reason is required when keeping this ${normalizedEntityLabel} on hold.`,
          fieldLabel: "Hold reason",
          idle: "Update hold reason",
          placeholder: `Explain why this ${normalizedEntityLabel} should stay on hold.`,
          success: "Hold updated!",
        }
      : {
          busy: "Putting on hold...",
          error: `A hold reason is required when putting this ${normalizedEntityLabel} on hold.`,
          fieldLabel: "Put on hold reason",
          idle: `Put ${normalizedEntityLabel} on hold`,
          placeholder: `Explain why this ${normalizedEntityLabel} is being put on hold.`,
          success: "Put on hold!",
        }
    : isCurrentlyRejected
      ? {
          busy: "Saving rejection reason...",
          error: `A rejection reason is required when keeping this ${normalizedEntityLabel} rejected.`,
          fieldLabel: "Rejection reason",
          idle: "Update rejection reason",
          placeholder: `Explain why this ${normalizedEntityLabel} should stay rejected.`,
          success: "Rejection updated!",
        }
      : {
          busy: rejectingLabel,
          error: `A rejection reason is required when rejecting this ${normalizedEntityLabel}.`,
          fieldLabel: "Rejection reason",
          idle: rejectLabel,
          placeholder: `Explain why this ${normalizedEntityLabel} is being rejected.`,
          success: "Rejected!",
        };

  async function handleApprove() {
    if (!canApprove) {
      return;
    }

    setError(null);
    setShowRejectReason(false);
    setIsApproving(true);

    const result = await submitReview({
      id,
      data: { status: "approved", rejectionReason: null },
    });

    setIsApproving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setApproveSuccess(true);
    router.replace(successHref);
    router.refresh();
  }

  async function handleReject() {
    if (!nextReasonStatus) {
      return;
    }

    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError(rejectActionCopy.error);
      return;
    }

    setError(null);
    setIsRejecting(true);

    const result = await submitReview({
      id,
      data: {
        status: nextReasonStatus,
        rejectionReason: trimmedReason,
      },
    });

    setIsRejecting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setRejectSuccess(true);
    router.replace(successHref);
    router.refresh();
  }

  function openRejectReason() {
    if (!nextReasonStatus) {
      return;
    }

    setError(null);
    setShowRejectReason(true);
  }

  function closeRejectReason() {
    setError(null);
    setRejectionReason("");
    setShowRejectReason(false);
  }

  return (
    <div className="space-y-4">
      {error ? <FieldError errors={[{ message: error }]} /> : null}
      {!canApprove && !nextReasonStatus ? (
        <FieldDescription>
          No moderation actions are available for this {normalizedEntityLabel}{" "}
          right now.
        </FieldDescription>
      ) : null}

      {showRejectReason ? (
        <div className="space-y-2">
          <label
            htmlFor={`review-rejection-${id}`}
            className="text-sm font-medium text-foreground"
          >
            {rejectActionCopy.fieldLabel}
          </label>
          <textarea
            id={`review-rejection-${id}`}
            value={rejectionReason}
            onChange={(event) => setRejectionReason(event.target.value)}
            placeholder={rejectActionCopy.placeholder}
            className="min-h-28 w-full rounded-3xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            disabled={isBusy}
          />
          <FieldDescription>
            This reason will be visible to the creator. Be clear and specific.
          </FieldDescription>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {canApprove && !isAlreadyApproved && !showRejectReason && (
          <Button
            type="button"
            onClick={() => void handleApprove()}
            disabled={isBusy || approveSuccess}
          >
            {approveSuccess
              ? approveActionCopy.success
              : isApproving
                ? approveActionCopy.busy
                : approveActionCopy.idle}
          </Button>
        )}
        {showRejectReason ? (
          <>
            <Button
              type="button"
              variant="outline"
              onClick={closeRejectReason}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void handleReject()}
              disabled={isBusy || rejectSuccess}
            >
              {rejectSuccess
                ? rejectActionCopy.success
                : isRejecting
                  ? rejectActionCopy.busy
                  : rejectActionCopy.idle}
            </Button>
          </>
        ) : nextReasonStatus ? (
          <Button
            type="button"
            variant="destructive"
            onClick={openRejectReason}
            disabled={isBusy || rejectSuccess}
          >
            {rejectActionCopy.idle}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
