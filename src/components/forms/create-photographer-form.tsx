"use client";

import { useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ZodError } from "zod";
import { PhotographerOnboardingAvatarStep } from "@/components/forms/photographer-onboarding/avatar-step";
import { PhotographerOnboardingContactStep } from "@/components/forms/photographer-onboarding/contact-step";
import { PhotographerOnboardingProfileStep } from "@/components/forms/photographer-onboarding/profile-step";
import { PhotographerOnboardingServicesStep } from "@/components/forms/photographer-onboarding/services-step";
import {
  type AvailableSpecialityOption,
  type OnboardingFormValues,
  type StepNumber,
  stepFieldPaths,
  toFormValues,
} from "@/components/forms/photographer-onboarding/types";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  isApprovedPhotographer,
  isPhotographerPendingReview,
} from "@/lib/photographer-status";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type { PhotographerOnboardingState } from "@/zod/schema/photographer";
import { savePhotographerOnboardingStepSchema } from "@/zod/schema/photographer";

function buildProfileStepPayload(values: OnboardingFormValues) {
  return {
    step: ONBOARDING_STEPS[1],
    name: values.name,
    bio: values.bio.trim() ? values.bio : undefined,
    locationCity: values.locationCity,
    experienceYears: values.experienceYears,
  };
}

function buildSpecialitiesStepPayload(values: OnboardingFormValues) {
  const selectedSpecialityIds = new Set(values.selectedSpecialityIds);

  return {
    step: ONBOARDING_STEPS[2],
    specialities: values.specialities
      .filter((speciality) =>
        selectedSpecialityIds.has(speciality.specialityId),
      )
      .map((speciality) => ({
        specialityId: speciality.specialityId,
        startingPrice: speciality.startingPrice,
      })),
  };
}

function buildStepPayload(step: StepNumber, values: OnboardingFormValues): unknown {
  switch (step) {
    case ONBOARDING_STEPS[0]:
      return buildProfileStepPayload(values);
    case ONBOARDING_STEPS[1]:
      return {
        step: ONBOARDING_STEPS[0],
        avatar: values.avatar,
      };
    case ONBOARDING_STEPS[2]:
      return buildSpecialitiesStepPayload(values);
    case ONBOARDING_STEPS[3]:
      return {
        step,
        contact: {
          email: values.contact.email,
          isPublic: values.contact.isPublic,
          phone: values.contact.phone,
        },
      };
    default:
      return buildProfileStepPayload(values);
  }
}

function getStepActionLabel(
  step: StepNumber,
  isSubmittedForReview: boolean,
  isEditingApprovedProfile: boolean,
) {
  switch (step) {
    case ONBOARDING_STEPS[0]:
      return "Save profile details";
    case ONBOARDING_STEPS[1]:
      return "Save avatar";
    case ONBOARDING_STEPS[2]:
      return "Save specialities";
    case ONBOARDING_STEPS[3]:
      return isSubmittedForReview || isEditingApprovedProfile
        ? "Save changes"
        : "Submit for review";
    default:
      return "Save changes";
  }
}

function getStepSuccessMessage(
  step: StepNumber,
  wasPendingReview: boolean,
  wasApprovedProfile: boolean,
) {
  switch (step) {
    case ONBOARDING_STEPS[0]:
      return "Profile details saved.";
    case ONBOARDING_STEPS[1]:
      return "Avatar saved.";
    case ONBOARDING_STEPS[2]:
      return "Specialities saved.";
    case ONBOARDING_STEPS[3]:
      return wasPendingReview || wasApprovedProfile
        ? "Changes saved."
        : "Submitted for review.";
    default:
      return "Changes saved.";
  }
}

function applyValidationErrors(
  errors: ZodError,
  form: ReturnType<typeof useForm<OnboardingFormValues>>,
) {
  for (const issue of errors.issues) {
    if (issue.path.length === 0) {
      continue;
    }

    form.setError(issue.path.join(".") as Path<OnboardingFormValues>, {
      message: issue.message,
      type: "manual",
    });
  }
}

export function CreatePhotographerForm({
  availableSpecialities,
  defaultEmail,
  initialData,
}: {
  availableSpecialities: AvailableSpecialityOption[];
  defaultEmail: string;
  initialData: PhotographerOnboardingState;
}) {
  const [savingStep, setSavingStep] = useState<StepNumber | null>(null);
  const [contactEmailVerified, setContactEmailVerified] = useState(
    initialData.contact?.emailVerified ?? false,
  );
  const [isSubmittedForReview, setIsSubmittedForReview] = useState(
    isPhotographerPendingReview(initialData),
  );
  const [isEditingApprovedProfile, setIsEditingApprovedProfile] = useState(
    isApprovedPhotographer(initialData),
  );

  const form = useForm<OnboardingFormValues>({
    defaultValues: toFormValues(
      initialData,
      defaultEmail,
      availableSpecialities,
    ),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    formState: { errors },
  } = form;
  const watchedValues = form.watch();
  const isSaving = savingStep !== null;

  function isStepComplete(step: StepNumber) {
    return savePhotographerOnboardingStepSchema.safeParse(
      buildStepPayload(step, watchedValues),
    ).success;
  }

  const isContactStepReady =
    isStepComplete(ONBOARDING_STEPS[0]) &&
    isStepComplete(ONBOARDING_STEPS[1]) &&
    isStepComplete(ONBOARDING_STEPS[2]) &&
    isStepComplete(ONBOARDING_STEPS[3]);

  async function saveStep(step: StepNumber) {
    form.clearErrors(stepFieldPaths[step]);
    const wasPendingReview = isSubmittedForReview;
    const wasApprovedProfile = isEditingApprovedProfile;
    const values = form.getValues();
    const payload = buildStepPayload(step, values);
    const parsedPayload =
      savePhotographerOnboardingStepSchema.safeParse(payload);

    if (!parsedPayload.success) {
      applyValidationErrors(parsedPayload.error, form);
      return;
    }

    setSavingStep(step);

    try {
      const response = await apiClient.photographer.onboarding.$patch({
        json: parsedPayload.data,
      });
      const responsePayload = await response.json().catch(() => null);

      if (!response.ok || !responsePayload) {
        toast.error(
          getApiErrorMessage(responsePayload) ??
            "We couldn't save this onboarding step.",
        );
        return;
      }

      const nextState = responsePayload as PhotographerOnboardingState;
      setContactEmailVerified(nextState.contact?.emailVerified ?? false);
      setIsSubmittedForReview(isPhotographerPendingReview(nextState));
      setIsEditingApprovedProfile(isApprovedPhotographer(nextState));

      toast.success(
        getStepSuccessMessage(
          step,
          wasPendingReview,
          wasApprovedProfile,
        ),
      );
    } finally {
      setSavingStep(null);
    }
  }

  return (
    <div className="space-y-10">
      <section className="space-y-5 border-b border-border/70 pb-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Profile details
          </h2>
          <p className="text-sm text-muted-foreground">
            Tell clients how you want to be seen.
          </p>
        </div>

        <PhotographerOnboardingProfileStep
          errors={errors}
          form={form}
          isSaving={isSaving}
        />

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(ONBOARDING_STEPS[0])}
            disabled={isSaving || !isStepComplete(ONBOARDING_STEPS[0])}
          >
            {savingStep === ONBOARDING_STEPS[0]
              ? "Saving..."
              : getStepActionLabel(
                  ONBOARDING_STEPS[0],
                  isSubmittedForReview,
                  isEditingApprovedProfile,
                )}
          </Button>
        </div>
      </section>

      <section className="space-y-5 border-b border-border/70 pb-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Avatar</h2>
          <p className="text-sm text-muted-foreground">
            The profile image clients will recognize first.
          </p>
        </div>

        <PhotographerOnboardingAvatarStep
          errors={errors}
          form={form}
          isSaving={isSaving}
        />

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(ONBOARDING_STEPS[1])}
            disabled={isSaving || !isStepComplete(ONBOARDING_STEPS[1])}
          >
            {savingStep === ONBOARDING_STEPS[1]
              ? "Saving..."
              : getStepActionLabel(
                  ONBOARDING_STEPS[1],
                  isSubmittedForReview,
                  isEditingApprovedProfile,
                )}
          </Button>
        </div>
      </section>

      <section className="space-y-5 border-b border-border/70 pb-8">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Specialities</h2>
          <p className="text-sm text-muted-foreground">
            Pick the services you offer, then add a starting price for each
            one.
          </p>
        </div>

        <PhotographerOnboardingServicesStep
          availableSpecialities={availableSpecialities}
          errors={errors}
          form={form}
          isSaving={isSaving}
        />

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(ONBOARDING_STEPS[2])}
            disabled={isSaving || !isStepComplete(ONBOARDING_STEPS[2])}
          >
            {savingStep === ONBOARDING_STEPS[2]
              ? "Saving..."
              : getStepActionLabel(
                  ONBOARDING_STEPS[2],
                  isSubmittedForReview,
                  isEditingApprovedProfile,
                )}
          </Button>
        </div>
      </section>

      <section className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            Contact details
          </h2>
          <p className="text-sm text-muted-foreground">
            {isEditingApprovedProfile
              ? "Save the best email and phone number for your photographer profile."
              : "When the rest of your portfolio is ready, save these details to submit for review."}
          </p>
        </div>

        <PhotographerOnboardingContactStep
          contactEmailVerified={contactEmailVerified}
          errors={errors}
          form={form}
          isSaving={isSaving}
        />

        <div className="flex justify-end pt-1">
          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(ONBOARDING_STEPS[3])}
            disabled={isSaving || !isContactStepReady}
          >
            {savingStep === ONBOARDING_STEPS[3]
              ? "Saving..."
              : getStepActionLabel(
                  ONBOARDING_STEPS[3],
                  isSubmittedForReview,
                  isEditingApprovedProfile,
                )}
          </Button>
        </div>
      </section>
    </div>
  );
}
