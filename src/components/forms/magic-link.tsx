"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError as FieldErrorComponent,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { type EmailPasswordAuth, emailPasswordAuthSchema } from "@/zod/schema";

export function MagicLinkForm({
  callbackUrl = "/account",
}: {
  callbackUrl?: string;
}) {
  const emailId = useId();
  const [sent, setSent] = useState(false);

  const form = useForm<Pick<EmailPasswordAuth, "email">>({
    resolver: zodResolver(emailPasswordAuthSchema.pick({ email: true })),
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: { email: string }) {
    const { error } = await authClient.signIn.magicLink({
      email: values.email,
      callbackURL: callbackUrl,
    });

    if (error) {
      toast.error(error.message ?? "Couldn't send sign-in link");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-4 rounded-md border bg-muted/40 pt-6 pb-4 text-center">
        <h1 className="text-xl font-semibold">Check your email</h1>

        <p className="text-sm text-muted-foreground">
          We sent a sign-in link to{" "}
          <span className="font-medium underline">
            {form.getValues("email")}
          </span>
        </p>

        <Button type="button" variant="ghost" onClick={() => setSent(false)}>
          Use a different email
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      <Field data-invalid={!!errors.email}>
        <FieldLabel htmlFor={emailId}>Email address</FieldLabel>

        <FieldContent>
          <Input
            id={emailId}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
            aria-invalid={!!errors.email}
            {...form.register("email")}
          />
        </FieldContent>

        {!errors.email && (
          <FieldDescription>
            We'll send you a secure sign-in link
          </FieldDescription>
        )}

        <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending link..." : "Send sign-in link"}
      </Button>
    </form>
  );
}
