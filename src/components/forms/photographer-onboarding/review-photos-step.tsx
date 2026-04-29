import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { PhotographerImagesManager } from "@/components/dashboard/photographer-images-manager";
import { FieldError as FieldErrorComponent } from "@/components/ui/field";
import {
  photographerReviewPhotoMinimum,
  photographerReviewPhotoRecommended,
} from "@/lib/photographer-upload-config";
import type { PhotographerOnboardingUploadInput } from "@/zod/schema/photographer";
import type { OnboardingFormValues } from "./types";

function getUploadsSignature(uploads: PhotographerOnboardingUploadInput[]) {
  return uploads
    .map((upload) =>
      [
        upload.id,
        upload.displayOrder,
        upload.imageUrl,
        upload.pinnedAt ?? "",
      ].join(":"),
    )
    .join("|");
}

function pluralizePhoto(count: number) {
  return count === 1 ? "photo" : "photos";
}

export function PhotographerOnboardingReviewPhotosStep({
  errors,
  form,
}: {
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
}) {
  const uploads = form.watch("uploads");
  const uploadsError = errors.uploads as { message?: string } | undefined;

  const uploadCount = uploads.length;
  const remainingMinimumCount = Math.max(
    photographerReviewPhotoMinimum - uploadCount,
    0,
  );
  const remainingRecommendedCount = Math.max(
    photographerReviewPhotoRecommended - uploadCount,
    0,
  );

  const progress = Math.min(
    (uploadCount / photographerReviewPhotoRecommended) * 100,
    100,
  );

  const statusMessage =
    uploadCount < photographerReviewPhotoMinimum
      ? `Add ${remainingMinimumCount} more ${pluralizePhoto(
          remainingMinimumCount,
        )} to continue.`
      : remainingRecommendedCount > 0
        ? `You can continue now, or add ${remainingRecommendedCount} more ${pluralizePhoto(
            remainingRecommendedCount,
          )} for a stronger review set.`
        : "Great. Your recommended review set is ready.";

  const statusClassName =
    uploadCount < photographerReviewPhotoMinimum
      ? "text-orange-700"
      : remainingRecommendedCount > 0
        ? "text-muted-foreground"
        : "text-emerald-700";

  function syncUploads(nextUploads: PhotographerOnboardingUploadInput[]) {
    const currentUploads = form.getValues("uploads");
    const hasChanged =
      getUploadsSignature(currentUploads) !== getUploadsSignature(nextUploads);

    if (!hasChanged) {
      if (nextUploads.length >= photographerReviewPhotoMinimum) {
        form.clearErrors("uploads");
      }

      return;
    }

    form.setValue("uploads", nextUploads, {
      shouldDirty: true,
      shouldValidate: false,
    });

    if (nextUploads.length >= photographerReviewPhotoMinimum) {
      form.clearErrors("uploads");
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-medium text-foreground">
              Add your best work
            </h3>

            <p className="max-w-xl text-[13px] leading-6 text-muted-foreground">
              Upload at least {photographerReviewPhotoMinimum} polished{" "}
              {pluralizePhoto(photographerReviewPhotoMinimum)} for review.{" "}
              {photographerReviewPhotoRecommended} is recommended.
            </p>
          </div>

          <p className="shrink-0 text-[13px] font-medium text-muted-foreground">
            {uploadCount}/{photographerReviewPhotoRecommended}
          </p>
        </div>

        <div className="space-y-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className={`text-[13px] ${statusClassName}`}>{statusMessage}</p>
        </div>
      </div>

      <PhotographerImagesManager
        context="review"
        initialUploads={uploads}
        onUploadsChange={syncUploads}
      />

      <FieldErrorComponent errors={uploadsError ? [uploadsError] : []} />
    </div>
  );
}