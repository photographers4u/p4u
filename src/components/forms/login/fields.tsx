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
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  buildAuthRedirectPath,
  getSafeAuthCallbackUrl,
} from "@/lib/auth-redirect";
import { authClient } from "@/lib/auth-client";
import {
  type EmailPasswordAuth,
  emailPasswordAuthSchema,
} from "@/zod/schema/auth-schema";

export function LoginFields({
  callbackUrl = "/account",
}: {
  callbackUrl?: string;
}) {
  const emailId = useId();
  const router = useRouter();
  const [redirectTarget, setRedirectTarget] = useState<
    "account" | "verification" | null
  >(null);

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

  function isEmailVerificationError(error: { message?: string; status?: number }) {
    return (
      error.status === 403 &&
      error.message?.toLowerCase().includes("verified") === true
    );
  }

  async function onSubmit(values: EmailPasswordAuth) {
    const normalizedEmail = values.email.trim().toLowerCase();
    const safeCallbackUrl = getSafeAuthCallbackUrl(callbackUrl);

    const { error } = await authClient.signIn.email({
      email: normalizedEmail,
      password: values.password,
      callbackURL: safeCallbackUrl,
    });

    if (error) {
      if (isEmailVerificationError(error)) {
        setRedirectTarget("verification");
        router.replace(
          buildAuthRedirectPath("/email-verification", {
            callbackUrl:
              safeCallbackUrl === "/account" ? undefined : safeCallbackUrl,
            email: normalizedEmail,
            intent: "signin",
          }),
        );
        return;
      }

      toast.error(error.message ?? "Invalid email or password");
      return;
    }

    // success -> switch state
    setRedirectTarget("account");

    router.replace(safeCallbackUrl);
  }

  const isBusy = isSubmitting || redirectTarget !== null;

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
            disabled={isBusy}
          />
        </FieldContent>

        {!errors.email && (
          <FieldDescription>
            Use the email you signed up with. If it is still unverified, we'll
            send you a fresh link.
          </FieldDescription>
        )}

        <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
      </Field>

      <PasswordField
        registration={form.register("password")}
        error={errors.password}
        showForgotPassword
        disabled={isBusy}
      />

      <Button type="submit" disabled={isBusy} className="w-full">
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Signing you in...
          </span>
        ) : redirectTarget ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            {redirectTarget === "verification"
              ? "Redirecting to verification..."
              : "Redirecting to your account..."}
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
