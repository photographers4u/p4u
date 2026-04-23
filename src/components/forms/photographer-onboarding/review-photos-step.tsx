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

export function PhotographerOnboardingReviewPhotosStep({
  errors,
  form,
}: {
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
}) {
  const uploads = form.watch("uploads");
  const uploadsError = errors.uploads as { message?: string } | undefined;
  const remainingRecommendedPhotoCount = Math.max(
    photographerReviewPhotoRecommended - uploads.length,
    0,
  );

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
      <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-4">
        <p className="text-sm font-semibold text-foreground">
          Upload {photographerReviewPhotoRecommended} review photos if you can.
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Add polished, client-ready work so admins can review your style. You
          can continue with {photographerReviewPhotoMinimum} strong sample, but{" "}
          {photographerReviewPhotoRecommended} gives reviewers a better sense of
          your work.
        </p>
        {uploads.length < photographerReviewPhotoMinimum ? (
          <p className="mt-3 text-xs font-medium text-orange-700">
            Add at least {photographerReviewPhotoMinimum} photo to continue.
          </p>
        ) : remainingRecommendedPhotoCount > 0 ? (
          <p className="mt-3 text-xs font-medium text-orange-700">
            You can continue now, or add {remainingRecommendedPhotoCount} more
            photo{remainingRecommendedPhotoCount === 1 ? "" : "s"} to reach the
            recommended set.
          </p>
        ) : (
          <p className="mt-3 text-xs font-medium text-emerald-700">
            Great, the recommended review set is ready.
          </p>
        )}
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
