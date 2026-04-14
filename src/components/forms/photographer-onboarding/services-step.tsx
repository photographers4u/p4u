import {
  type FieldErrors,
  type UseFormReturn,
  useController,
} from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { AvailableSpecialityOption, OnboardingFormValues } from "./types";

export function PhotographerOnboardingServicesStep({
  availableSpecialities,
  errors,
  form,
  isSaving,
}: {
  availableSpecialities: AvailableSpecialityOption[];
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
  isSaving: boolean;
}) {
  const specialitiesError = errors.specialities as
    | { message?: string }
    | undefined;
  const { field: selectedSpecialityIdsField } = useController({
    control: form.control,
    name: "selectedSpecialityIds",
  });
  const selectedSpecialityIds = selectedSpecialityIdsField.value ?? [];
  const selectedSpecialityIdSet = new Set(selectedSpecialityIds);
  const selectedSpecialities = availableSpecialities
    .map((speciality, formIndex) => ({
      formIndex,
      speciality,
    }))
    .filter(({ speciality }) => selectedSpecialityIdSet.has(speciality.id));

  function toggleSpeciality(specialityId: string) {
    const currentSelectedSpecialityIds = selectedSpecialityIds;
    const isRemoving = currentSelectedSpecialityIds.includes(specialityId);
    const nextSelectedSpecialityIds = currentSelectedSpecialityIds.includes(
      specialityId,
    )
      ? currentSelectedSpecialityIds.filter((id) => id !== specialityId)
      : [...currentSelectedSpecialityIds, specialityId];

    selectedSpecialityIdsField.onChange(nextSelectedSpecialityIds);
    selectedSpecialityIdsField.onBlur();

    if (
      currentSelectedSpecialityIds.length === 0 &&
      nextSelectedSpecialityIds.length > 0
    ) {
      form.clearErrors("specialities");
    }

    if (isRemoving) {
      const formIndex = availableSpecialities.findIndex(
        (speciality) => speciality.id === specialityId,
      );

      if (formIndex >= 0) {
        form.clearErrors(`specialities.${formIndex}.startingPrice`);
      }
    }
  }

  return (
    <div className="space-y-7">
        <div className="flex flex-wrap gap-2">
          {availableSpecialities.map((speciality) => {
            const isSelected = selectedSpecialityIdSet.has(speciality.id);

            return (
              <button
                key={speciality.id}
                type="button"
                onClick={() => toggleSpeciality(speciality.id)}
                disabled={isSaving}
                aria-pressed={isSelected}
                className={cn(
                  "inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-[13px] font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50",
                  isSelected
                    ? "border-primary/25 bg-primary/10 text-primary shadow-sm"
                    : "border-slate-200 bg-slate-50/70 text-slate-700 hover:border-slate-300 hover:bg-white",
                )}
              >
                {speciality.name}
              </button>
            );
          })}
        </div>

        <p className="text-[13px] text-muted-foreground my-6 mx-1">
          {selectedSpecialityIds.length === 0
            ? "Select at least one speciality to unlock the pricing table."
            : `${selectedSpecialityIds.length} selected. Add a starting price for each one below.`}
        </p>

      {selectedSpecialities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-sm text-muted-foreground">
          Pick one or more specialities above, then we&apos;ll open the pricing
          table here.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/70 backdrop-blur-sm mt-12">
          <div className="hidden gap-3 border-b border-slate-200/80 px-4 py-3 text-[13px] font-medium text-neutral-600 sm:grid sm:grid-cols-[minmax(0,1fr)_170px]">
            <div>Selected speciality</div>
            <div className="ml-1">Starting price</div>
          </div>

          <div className="divide-y divide-slate-200/80">
            {selectedSpecialities.map(({ speciality, formIndex }) => (
              <div
                key={speciality.id}
                className="grid items-center gap-3 pr-4 pl-3 py-2 sm:grid-cols-[minmax(0,1fr)_170px]"
              >
                {/*
                  Use the full speciality list index so values stay aligned
                  even when only selected rows are rendered here.
                */}
                <Field>
                  <FieldContent className="text-sm font-medium text-neutral-700 pl-1">
                      {speciality.name}
                  </FieldContent>
                </Field>

                <Field
                  data-invalid={
                    !!errors.specialities?.[formIndex]?.startingPrice
                  }
                >
                  <FieldLabel
                    htmlFor={`speciality-price-${speciality.id}`}
                    className="text-xs font-medium tracking-wide text-muted-foreground uppercase sm:sr-only"
                  >
                    Starting price for {speciality.name}
                  </FieldLabel>
                  <FieldContent>
                    <div className="relative">
                      {/*
                        Keep prices required for selected rows instead of
                        silently dropping blank selections during save.
                      */}
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                        Rs.
                      </span>
                      <Input
                        id={`speciality-price-${speciality.id}`}
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        className="pl-11"
                        aria-label={`${speciality.name} price`}
                        aria-invalid={
                          !!errors.specialities?.[formIndex]?.startingPrice
                        }
                        disabled={isSaving}
                        {...form.register(`specialities.${formIndex}.startingPrice`, {
                          onChange: (event) => {
                            if (
                              typeof event.target.value === "string" &&
                              event.target.value.trim() !== ""
                            ) {
                              form.clearErrors(
                                `specialities.${formIndex}.startingPrice`,
                              );
                            }
                          },
                        })}
                      />
                    </div>
                  </FieldContent>
                  <FieldErrorComponent
                    errors={
                      errors.specialities?.[formIndex]?.startingPrice
                        ? [errors.specialities[formIndex]?.startingPrice]
                        : []
                    }
                  />
                </Field>
              </div>
            ))}
          </div>
        </div>
      )}

      <FieldErrorComponent
        errors={specialitiesError ? [specialitiesError] : []}
      />
    </div>
  );
}
