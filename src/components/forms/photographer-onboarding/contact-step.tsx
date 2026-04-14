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
import { cn } from "@/lib/utils";
import type { OnboardingFormValues } from "./types";

export function PhotographerOnboardingContactStep({
  contactEmailVerified,
  errors,
  form,
  isSaving,
}: {
  contactEmailVerified: boolean;
  errors: FieldErrors<OnboardingFormValues>;
  form: UseFormReturn<OnboardingFormValues>;
  isSaving: boolean;
}) {
  const contactEmailId = useId();
  const contactPhoneId = useId();
  const contactPublicId = useId();

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.contact?.phone}>
          <FieldLabel htmlFor={contactPhoneId}>Phone</FieldLabel>
          <FieldContent>
            <Input
              id={contactPhoneId}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              aria-invalid={!!errors.contact?.phone}
              disabled={isSaving}
              {...form.register("contact.phone")}
            />
          </FieldContent>
          <FieldErrorComponent
            errors={errors.contact?.phone ? [errors.contact.phone] : []}
          />
        </Field>

        <Field data-invalid={!!errors.contact?.email}>
          <FieldLabel htmlFor={contactEmailId}>Email</FieldLabel>
          <FieldContent>
            <Input
              id={contactEmailId}
              placeholder="hello@studio.com"
              autoComplete="email"
              aria-invalid={!!errors.contact?.email}
              disabled={isSaving}
              {...form.register("contact.email")}
            />
            {contactEmailVerified ? (
              <FieldDescription>
                This email is already marked as verified.
              </FieldDescription>
            ) : null}
          </FieldContent>
          <FieldErrorComponent
            errors={errors.contact?.email ? [errors.contact.email] : []}
          />
        </Field>
      </div>

      <label
        htmlFor={contactPublicId}
        className={cn(
          "flex cursor-pointer items-start gap-3 pt-1 transition-colors",
          isSaving && "pointer-events-none opacity-60",
        )}
      >
        <input
          id={contactPublicId}
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300"
          disabled={isSaving}
          {...form.register("contact.isPublic")}
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-950">
            Show this contact publicly
          </p>
          <p className="text-sm text-slate-500">
            Turn this on if clients should see your saved contact details on the
            public profile.
          </p>
        </div>
      </label>
    </div>
  );
}
