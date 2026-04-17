"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { cn } from "@/lib/utils";
import type { PhotographerContact } from "@/zod/schema";
import { savePhotographerContactSchema } from "@/zod/schema";

const contactSchema = savePhotographerContactSchema;

type ContactUpdateFormValues = z.input<typeof contactSchema>;
type ContactUpdateFormOutput = z.output<typeof contactSchema>;

function toContactFormValues(
  contact: Pick<PhotographerContact, "email" | "phone" | "isPublic">,
): ContactUpdateFormValues {
  return {
    email: contact.email,
    phone: contact.phone,
    isPublic: contact.isPublic,
  };
}

export function PhotographerContactUpdateForm({
  canSubmit = true,
  contact,
}: {
  canSubmit?: boolean;
  contact: PhotographerContact;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [contactEmailVerified, setContactEmailVerified] = useState(
    contact.emailVerified,
  );
  const form = useForm<
    ContactUpdateFormValues,
    undefined,
    ContactUpdateFormOutput
  >({
    resolver: zodResolver(contactSchema),
    defaultValues: toContactFormValues(contact),
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isDirty, isSubmitting: isSaving },
  } = form;

  const contactEmailId = useId();
  const contactPhoneId = useId();
  const contactPublicId = useId();
  const isBusy = isSaving || isRefreshing;
  const isInteractionDisabled = isBusy || !canSubmit;
  const canSave = canSubmit && isDirty;

  async function onSubmit(values: ContactUpdateFormOutput) {
    if (!canSubmit || !form.formState.isDirty) {
      return;
    }

    const response = await apiClient.photographer.contact.$patch({
      json: values,
    });
    const { errorMessage, payload } =
      await readApiResponse<PhotographerContact>(response);

    if (!response.ok) {
      toast.error(errorMessage ?? "Couldn't update photographer contact.");
      return;
    }

    const nextContact = payload as PhotographerContact | null;

    if (!nextContact) {
      toast.error("The photographer contact response was incomplete.");
      return;
    }

    setContactEmailVerified(nextContact.emailVerified);
    form.reset(toContactFormValues(nextContact));
    toast.success("Photographer contact updated successfully.");
    startRefresh(() => {
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor={contactPhoneId}>Phone</FieldLabel>
          <FieldContent>
            <Input
              id={contactPhoneId}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              aria-invalid={!!errors.phone}
              disabled={isInteractionDisabled}
              {...form.register("phone")}
            />
          </FieldContent>
          {!errors.phone ? (
            <FieldDescription>
              Add the phone number clients should use for enquiries and booking
              conversations.
            </FieldDescription>
          ) : null}
          <FieldErrorComponent errors={errors.phone ? [errors.phone] : []} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor={contactEmailId}>Email</FieldLabel>
          <FieldContent className="space-y-1.5">
            <Input
              id={contactEmailId}
              placeholder="hello@studio.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isInteractionDisabled}
              {...form.register("email")}
            />
            {contactEmailVerified ? (
              <FieldDescription>
                This email is already marked as verified.
              </FieldDescription>
            ) : !errors.email ? (
              <FieldDescription>
                Use the email address where you want client enquiries to land.
              </FieldDescription>
            ) : null}
          </FieldContent>
          <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
        </Field>
      </div>

      <label
        htmlFor={contactPublicId}
        className={cn(
          "flex cursor-pointer items-start gap-3 pt-1 transition-colors",
          isInteractionDisabled && "pointer-events-none opacity-60",
        )}
      >
        <input
          id={contactPublicId}
          type="checkbox"
          className="mt-1 size-4 rounded border-slate-300"
          disabled={isInteractionDisabled}
          {...form.register("isPublic")}
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

      {!canSubmit ? (
        <p className="text-sm text-muted-foreground">
          Contact updates are available only after your photographer profile is
          approved.
        </p>
      ) : !isDirty ? (
        <p className="text-sm text-muted-foreground">
          Make a change to enable saving your contact details.
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={isInteractionDisabled || !canSave}
        className="w-full sm:w-auto"
      >
        {isSaving ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Saving contact...
          </span>
        ) : isRefreshing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Contact saved, refreshing...
          </span>
        ) : !canSubmit ? (
          "Contact locked until approval"
        ) : !isDirty ? (
          "No contact changes yet"
        ) : (
          "Save contact"
        )}
      </Button>
    </form>
  );
}
