"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { type Path, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { ZodError } from "zod";
import { PhotographerOnboardingAvatarStep } from "@/components/forms/photographer-onboarding/avatar-step";
import { PhotographerOnboardingContactStep } from "@/components/forms/photographer-onboarding/contact-step";
import { PhotographerOnboardingProfileStep } from "@/components/forms/photographer-onboarding/profile-step";
import { PhotographerOnboardingServicesStep } from "@/components/forms/photographer-onboarding/services-step";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  isApprovedPhotographer,
  isPhotographerPendingReview,
} from "@/lib/photographer-status";
import { cn } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import { savePhotographerOnboardingStepSchema } from "@/zod/schema/photographer";
import type { PhotographerOnboardingState } from "@/zod/schema/photographer";
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
    title: "Contact details",
    description:
      "When the rest of your portfolio is ready, save these details to submit for review.",
  },
];

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

function getStepActionLabel(
  step: StepNumber,
  isSubmittedForReview: boolean,
  isEditingApprovedProfile: boolean,
) {
  if (step !== ONBOARDING_STEPS[3]) {
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

  return ONBOARDING_STEPS[3];
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
  const [activeStep, setActiveStep] = useState<StepNumber>(() =>
    getFirstIncompleteStep(defaultValues),
  );
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
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    formState: { errors },
  } = form;
  const watchedValues = form.watch();
  const isSaving = savingStep !== null;
  const firstIncompleteStep = getFirstIncompleteStep(watchedValues);
  const activeStepMeta = onboardingStepMeta.find(
    (step) => step.step === activeStep,
  );
  const previousStep = getPreviousStep(activeStep);

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
            isSaving={isSaving}
          />
        );
      case ONBOARDING_STEPS[1]:
        return (
          <PhotographerOnboardingAvatarStep
            errors={errors}
            form={form}
            isSaving={isSaving}
          />
        );
      case ONBOARDING_STEPS[2]:
        return (
          <PhotographerOnboardingServicesStep
            availableSpecialities={availableSpecialities}
            canSubmit
            errors={errors}
            form={form}
            isSaving={isSaving}
          />
        );
      case ONBOARDING_STEPS[3]:
        return (
          <PhotographerOnboardingContactStep
            contactEmailVerified={contactEmailVerified}
            errors={errors}
            form={form}
            isSaving={isSaving}
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
      const responsePayload = await response.json().catch(() => null);

      if (!response.ok || !responsePayload) {
        toast.error(
          getApiErrorMessage(responsePayload) ??
            "We couldn't save this onboarding step.",
        );
        return;
      }

      const nextState = responsePayload as PhotographerOnboardingState;
      const nextValues = toFormValues(
        nextState,
        defaultEmail,
        availableSpecialities,
      );
      const nextResumeStep = getFirstIncompleteStep(nextValues);

      form.reset(nextValues);
      setContactEmailVerified(nextState.contact?.emailVerified ?? false);
      setIsSubmittedForReview(isPhotographerPendingReview(nextState));
      setIsEditingApprovedProfile(isApprovedPhotographer(nextState));
      setActiveStep(nextResumeStep);

      toast.success(
        getStepSuccessMessage(
          step,
          wasPendingReview,
          wasApprovedProfile,
        ),
      );

      if (
        isPhotographerPendingReview(nextState) ||
        isApprovedPhotographer(nextState)
      ) {
        router.replace("/dashboard/portfolio");
        router.refresh();
      }
    } finally {
      setSavingStep(null);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border/70 bg-muted/20 px-5 py-4 text-sm text-muted-foreground">
        Your progress is saved after each step, so you can leave and come back
        anytime.
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {onboardingStepMeta.map((step, index) => {
          const isCurrent = step.step === activeStep;
          const isComplete = isStepComplete(step.step);
          const isUnlocked = step.step <= firstIncompleteStep;

          return (
            <button
              key={step.step}
              type="button"
              onClick={() => {
                if (isUnlocked) {
                  setActiveStep(step.step);
                }
              }}
              disabled={isSaving || !isUnlocked}
              className={cn(
                "rounded-2xl border px-4 py-4 text-left transition",
                isCurrent &&
                  "border-primary bg-primary/5 shadow-sm",
                !isCurrent &&
                  isUnlocked &&
                  "border-border/70 hover:border-border hover:bg-muted/20",
                !isUnlocked &&
                  "cursor-not-allowed border-border/40 bg-muted/10 opacity-60",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Step {index + 1}
              </p>
              <p className="mt-2 font-semibold text-foreground">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isCurrent
                  ? "Current step"
                  : isComplete
                    ? "Saved"
                    : isUnlocked
                      ? "Ready"
                      : "Complete the earlier steps first"}
              </p>
            </button>
          );
        })}
      </div>

      <section className="space-y-6 rounded-3xl border border-border/70 bg-background p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">
            {activeStepMeta?.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {activeStep === ONBOARDING_STEPS[3] && isEditingApprovedProfile
              ? "Save the best email and phone number for your photographer profile."
              : activeStepMeta?.description}
          </p>
        </div>

        {renderActiveStep()}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (previousStep) {
                setActiveStep(previousStep);
              }
            }}
            disabled={!previousStep || isSaving}
          >
            Back
          </Button>

          <Button
            type="button"
            size="lg"
            onClick={() => void saveStep(activeStep)}
            disabled={isSaving || !isStepComplete(activeStep)}
          >
            {savingStep === activeStep
              ? "Saving..."
              : getStepActionLabel(
                  activeStep,
                  isSubmittedForReview,
                  isEditingApprovedProfile,
                )}
          </Button>
        </div>
      </section>
    </div>
  );
}
