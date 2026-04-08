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

  async function onSubmit(values: EmailPasswordAuth) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      callbackURL: callbackUrl,
    });

    if (error) {
      toast.error(error.message ?? "Invalid email or password");
      return;
    }

    // success -> switch state
    setIsRedirecting(true);

    router.replace(callbackUrl);
  }

  const isBusy = isSubmitting || isRedirecting;

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
          <FieldDescription>Use the email you signed up with</FieldDescription>
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
        ) : isRedirecting ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            You're In, Redirecting...
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
