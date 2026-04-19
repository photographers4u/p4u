"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PasswordField } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError as FieldErrorComponent,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { buildAuthRedirectPath } from "@/lib/auth-redirect";
import { requestRegistrationEmailStatus } from "@/lib/request-registration-email-status";
import { requestVerificationEmail } from "@/lib/request-verification-email";
import { type EmailPasswordAuth, emailPasswordAuthSchema } from "@/zod/schema";

export function RegisterFields() {
  const emailId = useId();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<EmailPasswordAuth>({
    resolver: zodResolver(emailPasswordAuthSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  const isBusy = isSubmitting || isRedirecting;

  async function onSubmit(values: EmailPasswordAuth) {
    const username = (values.email?.split("@")[0] ?? "")
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const normalizedEmail = values.email.trim().toLowerCase();
    form.clearErrors("email");

    const existingEmailResult = await requestRegistrationEmailStatus({
      email: normalizedEmail,
    }).catch(() => null);

    if (!existingEmailResult?.ok) {
      toast.error(
        existingEmailResult?.errorMessage ??
          "We couldn't check whether that email is available. Please try again.",
      );
      return;
    }

    if (existingEmailResult.status === "existing_verified") {
      const message =
        "An account with this email already exists. Sign in instead.";
      form.setError("email", {
        type: "manual",
        message,
      });
      toast.error(message);
      return;
    }

    if (existingEmailResult.status === "existing_unverified") {
      const message =
        "An account with this email already exists and still needs verification. Sign in to resend the verification email.";
      form.setError("email", {
        type: "manual",
        message,
      });
      toast.error(message);
      return;
    }

    const { error } = await authClient.signUp.email({
      name: username,
      email: normalizedEmail,
      password: values.password,
      callbackURL: "/account",
    });

    if (error) {
      toast.error(error.message ?? "Couldn't create your account");
      return;
    }

    let delivery: "failed" | undefined;

    try {
      const result = await requestVerificationEmail({
        callbackURL: "/account",
        email: normalizedEmail,
      });

      if (!result.ok) {
        delivery = "failed";
      }
    } catch {
      delivery = "failed";
    }

    setIsRedirecting(true);

    router.replace(
      buildAuthRedirectPath("/email-verification", {
        callbackUrl: "/account",
        delivery,
        email: normalizedEmail,
        intent: "signup",
      }),
    );
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
      noValidate
    >
      <FieldGroup>
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
              disabled={isBusy}
            />
          </FieldContent>

          {!errors.email && (
            <FieldDescription>
              We'll send a verification link to this email
            </FieldDescription>
          )}

          <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
        </Field>

        <PasswordField
          registration={form.register("password")}
          error={errors.password}
          placeholder="Create a strong password"
          description="At least 8 characters recommended"
          disabled={isBusy}
        />
      </FieldGroup>

      <Button type="submit" disabled={isBusy} className="w-full">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Creating your account...
          </span>
        ) : isRedirecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Taking you to email verification...
          </span>
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
