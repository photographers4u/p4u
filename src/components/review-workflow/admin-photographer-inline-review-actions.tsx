"use client";

import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FieldError } from "@/components/ui/field";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { getAllowedPhotographerReviewStatuses } from "@/lib/photographer-status";
import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

export function AdminPhotographerInlineReviewActions({
  photographerId,
  photographerName,
  status,
}: {
  photographerId: string;
  photographerName: string;
  status: PhotographerWorkflowStatus;
}) {
  const router = useRouter();
  const [approveOpen, setApproveOpen] = useState(false);
  const [reasonOpen, setReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedTransitions = getAllowedPhotographerReviewStatuses({ status });
  const canApprove =
    allowedTransitions.includes("approved") && status !== "approved";
  const nextReasonStatus = allowedTransitions.includes("on_hold")
    ? "on_hold"
    : allowedTransitions.includes("rejected")
      ? "rejected"
      : null;
  const isHoldFlow = nextReasonStatus === "on_hold";
  const isCurrentlyInReasonState =
    status === "rejected" || status === "on_hold";
  const displayName = photographerName || "this photographer";

  if (!canApprove && !nextReasonStatus) {
    return null;
  }

  const approveActionLabel =
    status === "on_hold" ? "Release from hold" : "Approve";
  const reasonActionLabel = isHoldFlow
    ? isCurrentlyInReasonState
      ? "Update hold reason"
      : "Put on hold"
    : isCurrentlyInReasonState
      ? "Update rejection reason"
      : "Reject";
  const reasonFieldLabel = isHoldFlow ? "Hold reason" : "Rejection reason";
  const reasonPlaceholder = isHoldFlow
    ? `Explain why ${displayName} is being put on hold.`
    : `Explain why ${displayName} is being rejected.`;

  async function submitReview(
    data:
      | { status: "approved"; rejectionReason?: null }
      | { status: "rejected" | "on_hold"; rejectionReason: string },
  ) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.photographer[":id"].review.$patch({
        param: { id: photographerId },
        json: data,
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        const message = errorMessage ?? "We couldn't save the review decision.";
        toast.error(message);
        setError(message);
        return;
      }

      toast.success(
        data.status === "approved"
          ? `${displayName} approved.`
          : data.status === "on_hold"
            ? `${displayName} put on hold.`
            : `${displayName} rejected.`,
      );
      setApproveOpen(false);
      setReasonOpen(false);
      setReason("");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReasonSubmit() {
    if (!nextReasonStatus) {
      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError(`A reason is required to ${reasonActionLabel.toLowerCase()}.`);
      return;
    }

    void submitReview({ status: nextReasonStatus, rejectionReason: trimmedReason });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label={`Review actions for ${displayName}`}
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canApprove ? (
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                setError(null);
                setApproveOpen(true);
              }}
            >
              {approveActionLabel}
            </DropdownMenuItem>
          ) : null}
          {nextReasonStatus ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault();
                setError(null);
                setReason("");
                setReasonOpen(true);
              }}
            >
              {reasonActionLabel}
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={approveOpen} onOpenChange={setApproveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{approveActionLabel}?</AlertDialogTitle>
            <AlertDialogDescription>
              {status === "on_hold"
                ? `${displayName}'s profile will go live again.`
                : `${displayName}'s profile will go live and they'll receive a verified badge.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error ? <FieldError errors={[{ message: error }]} /> : null}
          <AlertDialogFooter className="justify-start!">
            <AlertDialogAction
              disabled={isSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void submitReview({ status: "approved", rejectionReason: null });
              }}
            >
              {isSubmitting ? "Saving..." : "Confirm"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reasonOpen} onOpenChange={setReasonOpen}>
        <DialogContent>
          <div className="space-y-1.5">
            <DialogTitle>{reasonActionLabel}</DialogTitle>
            <DialogDescription>
              This reason will be visible to {displayName}. Be clear and
              specific.
            </DialogDescription>
          </div>

          <div className="space-y-2">
            <label
              htmlFor={`inline-review-reason-${photographerId}`}
              className="text-sm font-medium text-foreground"
            >
              {reasonFieldLabel}
            </label>
            <textarea
              id={`inline-review-reason-${photographerId}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder={reasonPlaceholder}
              className="min-h-28 w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              disabled={isSubmitting}
            />
            {error ? <FieldError errors={[{ message: error }]} /> : null}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setReasonOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting}
              onClick={handleReasonSubmit}
            >
              {isSubmitting ? "Saving..." : reasonActionLabel}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
