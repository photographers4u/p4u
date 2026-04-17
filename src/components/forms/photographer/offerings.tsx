"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  applyValidationErrors,
  buildSpecialitiesStepPayload,
} from "@/components/forms/photographer-onboarding/form-helpers";
import { PhotographerOnboardingServicesStep } from "@/components/forms/photographer-onboarding/services-step";
import {
  type AvailableSpecialityOption,
  type OnboardingFormValues,
  toFormValues,
} from "@/components/forms/photographer-onboarding/types";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-error";
import { readApiResponse } from "@/lib/api-response";
import {
  type PhotographerOnboardingState,
  savePhotographerOnboardingStepSchema,
} from "@/zod/schema/photographer";

export function PhotographerOfferingsForm({
  availableSpecialities,
  canSubmit = true,
  onboarding,
}: {
  availableSpecialities: AvailableSpecialityOption[];
  canSubmit?: boolean;
  onboarding: PhotographerOnboardingState;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const form = useForm<OnboardingFormValues>({
    defaultValues: toFormValues(onboarding, "", availableSpecialities),
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const {
    formState: { errors, isDirty, isSubmitting: isSaving },
  } = form;

  const isBusy = isSaving || isRefreshing;
  const isInteractionDisabled = isBusy || !canSubmit;
  const payload = buildSpecialitiesStepPayload(form.watch());
  const isValid =
    savePhotographerOnboardingStepSchema.safeParse(payload).success;

  async function onSubmit(values: OnboardingFormValues) {
    if (!canSubmit || !form.formState.isDirty) {
      return;
    }

    const nextPayload = buildSpecialitiesStepPayload(values);
    const parsedPayload =
      savePhotographerOnboardingStepSchema.safeParse(nextPayload);

    form.clearErrors(["selectedSpecialityIds", "specialities"]);

    if (!parsedPayload.success) {
      applyValidationErrors(parsedPayload.error, form);
      return;
    }

    const response = await apiClient.photographer.onboarding.$patch({
      json: parsedPayload.data,
    });
    const { payload: responsePayload } =
      await readApiResponse<PhotographerOnboardingState>(response);

    if (!response.ok || !responsePayload) {
      toast.error(
        getApiErrorMessage(responsePayload) ??
          "We couldn't update your offerings.",
      );
      return;
    }

    const nextState = responsePayload as PhotographerOnboardingState;

    form.reset(toFormValues(nextState, "", availableSpecialities));
    toast.success("Offerings updated successfully.");
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      <PhotographerOnboardingServicesStep
        canSubmit={canSubmit}
        availableSpecialities={availableSpecialities}
        errors={errors}
        form={form}
        isSaving={isInteractionDisabled}
      />

      {!canSubmit ? (
        <p className="text-sm text-muted-foreground">
          Offering updates are available only after your photographer profile is
          approved.
        </p>
      ) : !isDirty ? (
        <p className="text-sm text-muted-foreground">
          Make a change to enable saving your offerings.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isInteractionDisabled || !isDirty || !isValid}
        className="w-full sm:w-auto"
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving offerings...
          </span>
        ) : isRefreshing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Offerings saved, refreshing...
          </span>
        ) : !canSubmit ? (
          "Offerings locked until approval"
        ) : !isDirty ? (
          "No offering changes yet"
        ) : (
          "Save offerings"
        )}
      </Button>
    </form>
  );
}
