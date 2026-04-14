import { useId } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { AvatarUploadField } from "@/components/forms/avatar-upload-field";
import {
  Field,
  FieldContent,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import type { OnboardingFormValues } from "./types";

export function PhotographerOnboardingAvatarStep({
  errors,
  form,
  isSaving,
}: {
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
  isSaving: boolean;
}) {
  const avatarId = useId();
  const avatarValue = form.watch("avatar");

  return (
    <div className="space-y-5">
      <Field data-invalid={!!errors.avatar}>
        <FieldLabel className="sr-only" htmlFor={avatarId}>Profile avatar</FieldLabel>
        <FieldContent className="max-w-40">
          <AvatarUploadField
            inputId={avatarId}
            value={avatarValue}
            disabled={isSaving}
            previewAlt="Photographer avatar preview"
            uploadKind="photographerAvatar"
            onChange={(value) => {
              form.setValue("avatar", value, {
                shouldDirty: true,
              });
              form.clearErrors("avatar");
            }}
          />
        </FieldContent>
        <FieldErrorComponent errors={errors.avatar ? [errors.avatar] : []} />
      </Field>
    </div>
  );
}
