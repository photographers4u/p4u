import type {
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import type { ZodError } from "zod";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type z from "zod";
import { savePhotographerOnboardingStepSchema } from "@/zod/schema/photographer";
import type { OnboardingFormValues } from "./types";

const SPECIALITIES_STEP = ONBOARDING_STEPS[2];

type OnboardingSpecialitiesStepPayload = Extract<
  z.input<typeof savePhotographerOnboardingStepSchema>,
  { step: typeof SPECIALITIES_STEP }
>;

export function buildSpecialitiesStepPayload(
  values: OnboardingFormValues,
): OnboardingSpecialitiesStepPayload {
  const selectedSpecialityIds = new Set(values.selectedSpecialityIds);

  return {
    step: SPECIALITIES_STEP,
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

export function applyValidationErrors<TFieldValues extends FieldValues>(
  errors: ZodError,
  form: Pick<UseFormReturn<TFieldValues>, "setError">,
) {
  for (const issue of errors.issues) {
    if (issue.path.length === 0) {
      continue;
    }

    form.setError(issue.path.join(".") as FieldPath<TFieldValues>, {
      message: issue.message,
      type: "manual",
    });
  }
}
