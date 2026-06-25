"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { savePhotographerContactSchema } from "@/zod/schema/photographer-contact";
import { useAdminPhotographerEditMode } from "./admin-photographer-edit-mode";

type ContactFormValues = z.input<typeof savePhotographerContactSchema>;
type ContactFormOutput = z.output<typeof savePhotographerContactSchema>;

type ContactEntry = {
  email: string;
  emailVerified: boolean;
  isPublic: boolean;
  phone: string;
} | null;

function toFormValues(contact: ContactEntry): ContactFormValues {
  return {
    phone: contact?.phone ?? "",
    email: contact?.email ?? "",
    isPublic: contact?.isPublic ?? false,
  };
}

export function AdminPhotographerContactSection({
  contact,
  photographerId,
}: {
  contact: ContactEntry;
  photographerId: string;
}) {
  const isEditing = useAdminPhotographerEditMode();
  const router = useRouter();

  const form = useForm<ContactFormValues, undefined, ContactFormOutput>({
    resolver: zodResolver(savePhotographerContactSchema),
    defaultValues: toFormValues(contact),
    mode: "onSubmit",
  });

  const {
    formState: { errors, isDirty, isSubmitting },
  } = form;

  const phoneId = useId();
  const emailId = useId();
  const publicId = useId();

  async function onSubmit(values: ContactFormOutput) {
    const response = await apiClient.admin.photographers[":id"].contact.$patch({
      param: { id: photographerId },
      json: values,
    });
    const { errorMessage } = await readApiResponse(response);

    if (!response.ok) {
      toast.error(errorMessage ?? "Couldn't update the contact details.");
      return;
    }

    toast.success("Contact details updated.");
    form.reset(values);
    router.refresh();
  }

  if (!isEditing) {
    return contact ? (
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Phone
          </p>
          <p className="mt-2 text-sm text-foreground">{contact.phone}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Email
          </p>
          <p className="mt-2 text-sm text-foreground">{contact.email}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Email status
          </p>
          <p className="mt-2 text-sm text-foreground">
            {contact.emailVerified ? "Verified" : "Not verified"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/15 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Visibility
          </p>
          <p className="mt-2 text-sm text-foreground">
            {contact.isPublic
              ? "Shown on the public profile"
              : "Hidden from the public profile"}
          </p>
        </div>
      </div>
    ) : (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-muted/15 px-5 py-8 text-sm text-muted-foreground">
        No contact details have been added yet.
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor={phoneId}>Phone</FieldLabel>
          <FieldContent>
            <Input
              id={phoneId}
              disabled={isSubmitting}
              aria-invalid={!!errors.phone}
              {...form.register("phone")}
            />
          </FieldContent>
          <FieldErrorComponent errors={errors.phone ? [errors.phone] : []} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor={emailId}>Email</FieldLabel>
          <FieldContent>
            <Input
              id={emailId}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
          </FieldContent>
          <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
        </Field>
      </div>

      <label
        htmlFor={publicId}
        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 transition-colors hover:bg-muted/30"
      >
        <input
          id={publicId}
          type="checkbox"
          className="mt-1 size-4 rounded border-border accent-primary"
          disabled={isSubmitting}
          {...form.register("isPublic")}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-foreground">
            Show this contact publicly
          </span>
          <span className="block text-sm leading-6 text-muted-foreground">
            Turn this on if clients should see this contact on the public
            profile.
          </span>
        </span>
      </label>

      <Button type="submit" disabled={isSubmitting || !isDirty} size="sm">
        {isSubmitting ? "Saving..." : "Save contact"}
      </Button>
    </form>
  );
}
