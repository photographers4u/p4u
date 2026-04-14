import { useId } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CITIES, EXPERIENCE_YEARS } from "@/zod/helpers";
import type { OnboardingFormValues } from "./types";

export function PhotographerOnboardingProfileStep({
  errors,
  form,
  isSaving,
}: {
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
  isSaving: boolean;
}) {
  const nameId = useId();
  const bioId = useId();
  const cityId = useId();
  const experienceId = useId();
  const experienceYears = form.watch("experienceYears");
  const locationCity = form.watch("locationCity");

  return (
    <div className="space-y-5">
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <FieldContent>
          <Input
            id={nameId}
            placeholder="Aarav Patel"
            autoComplete="name"
            autoFocus
            aria-invalid={!!errors.name}
            disabled={isSaving}
            {...form.register("name")}
          />
        </FieldContent>
        <FieldErrorComponent errors={errors.name ? [errors.name] : []} />
      </Field>

      <Field data-invalid={!!errors.bio}>
        <FieldLabel htmlFor={bioId}>Bio</FieldLabel>
        <FieldContent>
          <Textarea
            id={bioId}
            rows={6}
            placeholder="Tell clients what kind of work you do and what makes your approach special."
            aria-invalid={!!errors.bio}
            disabled={isSaving}
            {...form.register("bio")}
          />
        </FieldContent>
        <FieldErrorComponent errors={errors.bio ? [errors.bio] : []} />
      </Field>

      <Field data-invalid={!!errors.experienceYears}>
        <FieldLabel htmlFor={experienceId}>Experience years</FieldLabel>
        <FieldContent>
          <Select
            value={experienceYears || undefined}
            onValueChange={(value) => {
              form.setValue(
                "experienceYears",
                value as (typeof EXPERIENCE_YEARS)[number],
                {
                  shouldDirty: true,
                },
              );
              form.clearErrors("experienceYears");
            }}
            disabled={isSaving}
          >
            <SelectTrigger
              id={experienceId}
              className="w-full"
              aria-invalid={!!errors.experienceYears}
            >
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_YEARS.map((year) => (
                <SelectItem key={year} value={year}>
                  {year} {year === "1" ? "year" : "years"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
        <FieldErrorComponent
          errors={errors.experienceYears ? [errors.experienceYears] : []}
        />
      </Field>

      <Field data-invalid={!!errors.locationCity}>
        <FieldLabel htmlFor={cityId}>City</FieldLabel>
        <FieldContent>
          <Select
            value={locationCity || undefined}
            onValueChange={(value) => {
              form.setValue("locationCity", value as (typeof CITIES)[number], {
                shouldDirty: true,
              });
              form.clearErrors("locationCity");
            }}
            disabled={isSaving}
          >
            <SelectTrigger
              id={cityId}
              className="w-full"
              aria-invalid={!!errors.locationCity}
            >
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
        <FieldErrorComponent
          errors={errors.locationCity ? [errors.locationCity] : []}
        />
      </Field>
    </div>
  );
}
