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
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field data-invalid={!!errors.contact?.phone}>
          <FieldLabel htmlFor={contactPhoneId}>Phone</FieldLabel>
          <FieldDescription>For calls or booking updates.</FieldDescription>

          <FieldContent>
            <Input
              id={contactPhoneId}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              aria-invalid={!!errors.contact?.phone}
              disabled={isSaving}
              className="h-fit px-3.5 py-3 text-[15px]!"
              {...form.register("contact.phone")}
            />
          </FieldContent>

          <FieldErrorComponent
            errors={errors.contact?.phone ? [errors.contact.phone] : []}
          />
        </Field>

        <Field data-invalid={!!errors.contact?.email}>
          <FieldLabel htmlFor={contactEmailId}>Email</FieldLabel>
          <FieldDescription>For booking and profile updates.</FieldDescription>

          <FieldContent>
            <Input
              id={contactEmailId}
              placeholder="hello@studio.com"
              autoComplete="email"
              aria-invalid={!!errors.contact?.email}
              disabled={isSaving}
              className="h-fit px-3.5 py-3 text-[15px]!"
              {...form.register("contact.email")}
            />

            {contactEmailVerified ? (
              <p className="text-sm font-medium text-emerald-700">
                This email is already verified.
              </p>
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
          "flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 transition-colors hover:bg-muted/30",
          isSaving && "pointer-events-none opacity-60",
        )}
      >
        <input
          id={contactPublicId}
          type="checkbox"
          className="mt-1 size-4 rounded border-border accent-primary"
          disabled={isSaving}
          {...form.register("contact.isPublic")}
        />

        <span className="space-y-1">
          <span className="block text-sm font-medium text-foreground">
            Show this contact publicly
          </span>

          <span className="block text-sm leading-6 text-muted-foreground">
            Turn this on if clients should see your saved contact details on
            your public profile.
          </span>
        </span>
      </label>
    </div>
  );
}
