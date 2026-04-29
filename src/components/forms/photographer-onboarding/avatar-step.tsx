import { useId } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { AvatarUploadField } from "@/components/forms/avatar-upload-field";
import {
  Field,
  FieldContent,
  FieldDescription,
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
    <div className="mx-auto flex w-full flex-col items-center">
      <Field
        data-invalid={!!errors.avatar}
        className="w-full items-center text-center"
      >
        <div className="space-y-2">
          <FieldLabel
            htmlFor={avatarId}
            className="justify-center text-base font-medium text-foreground"
          >
            Profile avatar
          </FieldLabel>

          <FieldDescription className="max-w-xs text-sm leading-6 text-muted-foreground">
            Upload a clear photo of yourself so clients can recognize your
            profile easily.
          </FieldDescription>
        </div>

        <FieldContent className="mt-6 flex w-full justify-center">
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
