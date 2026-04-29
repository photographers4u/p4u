import { useId } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import {
  Field,
  FieldContent,
  FieldDescription,
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
    <div className="space-y-8">
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor={nameId}>Name</FieldLabel>
        <FieldDescription className="text-[13px]">
          Use the name clients will see on your photographer profile.
        </FieldDescription>

        <FieldContent>
          <Input
            id={nameId}
            placeholder="Aarav Patel"
            autoComplete="name"
            className="px-3.5 py-3 h-fit text-[15px]!"
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
        <FieldDescription className="text-[13px]">
          Briefly describe your photography style, services, and what clients
          can expect from working with you.
        </FieldDescription>

        <FieldContent>
          <Textarea
            id={bioId}
            rows={9}
            placeholder="Tell clients what kind of work you do and what makes your approach special."
            aria-invalid={!!errors.bio}
            className="px-3.5 py-3 h-32 text-[15px]!"
            disabled={isSaving}
            {...form.register("bio")}
          />
        </FieldContent>

        <FieldErrorComponent errors={errors.bio ? [errors.bio] : []} />
      </Field>

      <Field data-invalid={!!errors.experienceYears}>
        <FieldLabel htmlFor={experienceId}>Experience years</FieldLabel>
        <FieldDescription className="text-[13px]">
          Select how many years of photography experience you currently have.
        </FieldDescription>

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
              className="w-full px-3.5 py-3 h-fit! text-[15px]!"
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
        <FieldDescription className="text-[13px]">
          Choose the city where you usually accept photography bookings.
        </FieldDescription>

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
              className="w-full px-3.5 py-3 h-fit! text-[15px]!"
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
