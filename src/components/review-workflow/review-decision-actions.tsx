"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldDescription, FieldError } from "@/components/ui/field";

export function ReviewDecisionActions({
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
  id: string;
  entityLabel: string;
  approveLabel: string;
  rejectLabel: string;
  approvingLabel: string;
  rejectingLabel: string;
  successHref: Route;
  currentStatus?: "pending" | "approved" | "rejected";
  submitReview: (input: {
    id: string;
    data:
      | { status: "approved"; rejectionReason?: null }
      | { status: "rejected"; rejectionReason: string };
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

  const isAlreadyApproved = currentStatus === "approved";
  const isBusy = isApproving || isRejecting;

  async function handleApprove() {
    setError(null);
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
    const trimmedReason = rejectionReason.trim();

    if (!trimmedReason) {
      setError(
        `A rejection reason is required when rejecting this ${entityLabel.toLowerCase()}.`,
      );
      return;
    }

    setError(null);
    setIsRejecting(true);

    const result = await submitReview({
      id,
      data: { status: "rejected", rejectionReason: trimmedReason },
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

  return (
    <div className="space-y-4">
      {error ? <FieldError errors={[{ message: error }]} /> : null}

      <div className="space-y-2">
        <label
          htmlFor={`review-rejection-${id}`}
          className="text-sm font-medium text-foreground"
        >
          {isAlreadyApproved ? "Takedown reason" : "Rejection reason"}
        </label>
        <textarea
          id={`review-rejection-${id}`}
          value={rejectionReason}
          onChange={(event) => setRejectionReason(event.target.value)}
          placeholder={
            isAlreadyApproved
              ? `Explain why this ${entityLabel.toLowerCase()} is being taken down.`
              : `Explain why this ${entityLabel.toLowerCase()} is being rejected.`
          }
          className="min-h-28 w-full rounded-3xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
          disabled={isBusy}
        />
        <FieldDescription>
          {isAlreadyApproved
            ? "This reason will be visible to the creator. Be clear and specific."
            : "Approving skips this field. Rejections should include clear feedback."}
        </FieldDescription>
      </div>

      <div className="flex flex-wrap gap-3">
        {!isAlreadyApproved && (
          <Button
            type="button"
            onClick={() => void handleApprove()}
            disabled={isBusy || approveSuccess}
          >
            {approveSuccess ? "Approved!" : isApproving ? approvingLabel : approveLabel}
          </Button>
        )}
        <Button
          type="button"
          variant="destructive"
          onClick={() => void handleReject()}
          disabled={isBusy || rejectSuccess}
        >
          {rejectSuccess
            ? isAlreadyApproved
              ? "Taken down!"
              : "Rejected!"
            : isRejecting
              ? rejectingLabel
              : isAlreadyApproved
                ? `Take down ${entityLabel.toLowerCase()}`
                : rejectLabel}
        </Button>
      </div>
    </div>
  );
}
