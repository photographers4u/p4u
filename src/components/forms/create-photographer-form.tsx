"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PhotographerOnboardingAvatarStep } from "@/components/forms/photographer-onboarding/avatar-step";
import { PhotographerOnboardingContactStep } from "@/components/forms/photographer-onboarding/contact-step";
import {
  applyValidationErrors,
  buildSpecialitiesStepPayload,
} from "@/components/forms/photographer-onboarding/form-helpers";
import { PhotographerOnboardingProfileStep } from "@/components/forms/photographer-onboarding/profile-step";
import { PhotographerOnboardingReviewPhotosStep } from "@/components/forms/photographer-onboarding/review-photos-step";
import { PhotographerOnboardingServicesStep } from "@/components/forms/photographer-onboarding/services-step";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { readApiResponse } from "@/lib/api-response";
import {
  isApprovedPhotographer,
  isPhotographerSubmittedForReview,
} from "@/lib/photographer-status";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type { PhotographerOnboardingState } from "@/zod/schema/photographer";
import { savePhotographerOnboardingStepSchema } from "@/zod/schema/photographer";
import {
  type AvailableSpecialityOption,
  type OnboardingFormValues,
  type StepNumber,
  stepFieldPaths,
  toFormValues,
} from "./photographer-onboarding/types";

const onboardingStepMeta: Array<{
  description: string;
  step: StepNumber;
  title: string;
}> = [
  {
    step: ONBOARDING_STEPS[0],
    title: "Profile details",
    description: "Tell clients how you want to be seen.",
  },
  {
    step: ONBOARDING_STEPS[1],
    title: "Avatar",
    description: "The profile image clients will recognize first.",
  },
  {
    step: ONBOARDING_STEPS[2],
    title: "Specialities",
    description:
      "Pick the services you offer, then add a starting price for each one.",
  },
  {
    step: ONBOARDING_STEPS[3],
    title: "Review photos",
    description: "Upload 4 strong samples if you can; 1 is enough to continue.",
  },
  {
    step: ONBOARDING_STEPS[4],
    title: "Contact details",
    description:
      "When the rest of your portfolio is ready, save these details to submit for review.",
  },
];

function buildProfileStepPayload(values: OnboardingFormValues) {
  return {
    step: ONBOARDING_STEPS[0],
    name: values.name,
    bio: values.bio.trim() ? values.bio : undefined,
    locationCity: values.locationCity,
    experienceYears: values.experienceYears,
  };
}

function buildStepPayload(
  step: StepNumber,
  values: OnboardingFormValues,
): unknown {
  switch (step) {
    case ONBOARDING_STEPS[0]:
      return buildProfileStepPayload(values);
    case ONBOARDING_STEPS[1]:
      return {
        step,
        avatar: values.avatar,
      };
    case ONBOARDING_STEPS[2]:
      return buildSpecialitiesStepPayload(values);
    case ONBOARDING_STEPS[3]:
      return {
        step,
        uploads: values.uploads.map((upload) => upload.id),
      };
    case ONBOARDING_STEPS[4]:
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
  if (step !== ONBOARDING_STEPS[4]) {
    return "Save and continue";
  }

  return isSubmittedForReview || isEditingApprovedProfile
    ? "Save changes"
    : "Submit for review";
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
      return "Review photos saved.";
    case ONBOARDING_STEPS[4]:
      return wasPendingReview || wasApprovedProfile
        ? "Changes saved."
        : "Submitted for review.";
    default:
      return "Changes saved.";
  }
}

function getFirstIncompleteStep(values: OnboardingFormValues): StepNumber {
  for (const step of ONBOARDING_STEPS) {
    if (
      !savePhotographerOnboardingStepSchema.safeParse(
        buildStepPayload(step, values),
      ).success
    ) {
      return step;
    }
  }

  return ONBOARDING_STEPS[ONBOARDING_STEPS.length - 1];
}

function getPreviousStep(step: StepNumber): StepNumber | null {
  const currentIndex = ONBOARDING_STEPS.indexOf(step);

  if (currentIndex <= 0) {
    return null;
  }

  return ONBOARDING_STEPS[currentIndex - 1] ?? null;
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
  const router = useRouter();

  const defaultValues = toFormValues(
    initialData,
    defaultEmail,
    availableSpecialities,
  );

  const [savingStep, setSavingStep] = useState<StepNumber | null>(null);
  const [isRoutingToPortfolio, startRoutingToPortfolio] = useTransition();

  const [activeStep, setActiveStep] = useState<StepNumber>(() =>
    getFirstIncompleteStep(defaultValues),
  );

  const [contactEmailVerified, setContactEmailVerified] = useState(
    initialData.contact?.emailVerified ?? false,
  );

  const [isSubmittedForReview, setIsSubmittedForReview] = useState(
    isPhotographerSubmittedForReview(initialData),
  );

  const [isEditingApprovedProfile, setIsEditingApprovedProfile] = useState(
    isApprovedPhotographer(initialData),
  );

  const form = useForm<OnboardingFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    formState: { errors },
  } = form;

  const watchedValues = form.watch();
  const isSaving = savingStep !== null;
  const isBusy = isSaving || isRoutingToPortfolio;
  const firstIncompleteStep = getFirstIncompleteStep(watchedValues);
  const previousStep = getPreviousStep(activeStep);

  const activeStepIndex = Math.max(
    onboardingStepMeta.findIndex((step) => step.step === activeStep),
    0,
  );

  const progressPercentage =
    ((activeStepIndex + 1) / onboardingStepMeta.length) * 100;

  function isStepComplete(step: StepNumber) {
    return savePhotographerOnboardingStepSchema.safeParse(
      buildStepPayload(step, watchedValues),
    ).success;
  }

  function renderActiveStep() {
    switch (activeStep) {
      case ONBOARDING_STEPS[0]:
        return (
          <PhotographerOnboardingProfileStep
            errors={errors}
            form={form}
            isSaving={isBusy}
          />
        );
      case ONBOARDING_STEPS[1]:
        return (
          <PhotographerOnboardingAvatarStep
            errors={errors}
            form={form}
            isSaving={isBusy}
          />
        );
      case ONBOARDING_STEPS[2]:
        return (
          <PhotographerOnboardingServicesStep
            availableSpecialities={availableSpecialities}
            canSubmit
            errors={errors}
            form={form}
            isSaving={isBusy}
          />
        );
      case ONBOARDING_STEPS[3]:
        return (
          <PhotographerOnboardingReviewPhotosStep errors={errors} form={form} />
        );
      case ONBOARDING_STEPS[4]:
        return (
          <PhotographerOnboardingContactStep
            contactEmailVerified={contactEmailVerified}
            errors={errors}
            form={form}
            isSaving={isBusy}
          />
        );
      default:
        return null;
    }
  }

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

      const { payload: responsePayload } =
        await readApiResponse<PhotographerOnboardingState>(response);

      if (!response.ok || !responsePayload) {
        toast.error(
          getApiErrorMessage(responsePayload) ??
            "We couldn't save this onboarding step.",
        );
        return;
      }

      const nextState = responsePayload as PhotographerOnboardingState;

      const shouldOpenPortfolio =
        isPhotographerSubmittedForReview(nextState) ||
        isApprovedPhotographer(nextState);

      if (shouldOpenPortfolio) {
        toast.success(
          getStepSuccessMessage(step, wasPendingReview, wasApprovedProfile),
        );

        startRoutingToPortfolio(() => {
          router.replace("/dashboard/portfolio");
        });

        return;
      }

      const nextValues = toFormValues(
        nextState,
        defaultEmail,
        availableSpecialities,
      );

      const nextResumeStep = getFirstIncompleteStep(nextValues);

      form.reset(nextValues);
      setContactEmailVerified(nextState.contact?.emailVerified ?? false);
      setIsSubmittedForReview(isPhotographerSubmittedForReview(nextState));
      setIsEditingApprovedProfile(isApprovedPhotographer(nextState));
      setActiveStep(nextResumeStep);

      toast.success(
        getStepSuccessMessage(step, wasPendingReview, wasApprovedProfile),
      );
    } finally {
      setSavingStep(null);
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-background">
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-border/70">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <main className="mx-auto flex w-full max-w-3xl flex-col px-5 pb-20 sm:px-6">
        <div className="w-full">{renderActiveStep()}</div>

        <div className="mt-12 flex items-center justify-between gap-4">
          {previousStep ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setActiveStep(previousStep);
              }}
              disabled={isBusy}
              className="px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            >
              Back
            </Button>
          ) : (
            <span />
          )}

          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(activeStep)}
            disabled={isBusy || !isStepComplete(activeStep)}
            className={cn(
              "min-w-40 rounded-full px-7 h-fit py-2.5 text-base",
              activeStep !== firstIncompleteStep &&
                "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {isRoutingToPortfolio
              ? "Opening portfolio..."
              : savingStep === activeStep
                ? "Saving..."
                : getStepActionLabel(
                    activeStep,
                    isSubmittedForReview,
                    isEditingApprovedProfile,
                  )}
          </Button>
        </div>
      </main>
    </div>
  );
}