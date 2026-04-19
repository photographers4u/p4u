"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { startTransition, useEffect, useId, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
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
import { apiClient } from "@/lib/api-client";
import { type AuthClientUser, authClient } from "@/lib/auth-client";

const accountFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  name: z.string().trim().min(1, "Enter your display name."),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;
type Notice = {
  message: string;
  tone: "error" | "info" | "success";
};

type SavedProfile = {
  email: string;
  emailVerified: boolean;
  name: string;
};

function getResponseMessage(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
  ) {
    return payload.message;
  }

  return fallback;
}

function fireNoticeToast(notice: Notice) {
  if (notice.tone === "error") toast.error(notice.message);
  else if (notice.tone === "success") toast.success(notice.message);
  else toast.info(notice.message);
}

export function AccountForm({
  initialNotice,
  pendingEmail,
  user,
}: {
  initialNotice?: Notice | null;
  pendingEmail: string | null;
  user: AuthClientUser;
}) {
  const nameId = useId();
  const emailId = useId();
  const [currentPendingEmail, setCurrentPendingEmail] = useState(pendingEmail);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [savedProfile, setSavedProfile] = useState<SavedProfile>({
    email: user.email,
    emailVerified: user.emailVerified,
    name: user.name,
  });

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      email: user.email,
      name: user.name,
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  useEffect(() => {
    const nextSavedProfile = {
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
    };

    setSavedProfile(nextSavedProfile);
    form.reset({
      email: nextSavedProfile.email,
      name: nextSavedProfile.name,
    });
    setCurrentPendingEmail(pendingEmail);
  }, [form, pendingEmail, user.email, user.emailVerified, user.name]);

  useEffect(() => {
    if (initialNotice) fireNoticeToast(initialNotice);
  }, [initialNotice]);

  const {
    formState: { errors, isSubmitting },
  } = form;

  const isBusy = isSubmitting || isResendingVerification;

  async function onSubmit(values: AccountFormValues) {
    const nextName = values.name.trim();
    const nextEmail = values.email.trim().toLowerCase();
    const currentEmail = savedProfile.email.toLowerCase();
    const nameChanged = nextName !== savedProfile.name;
    const emailChanged = nextEmail !== currentEmail;

    if (!nameChanged && !emailChanged) {
      toast.info("There aren't any changes to save yet.");
      return;
    }

    if (nameChanged) {
      const { error } = await authClient.updateUser({
        name: nextName,
      });

      if (error) {
        toast.error(
          error.message ?? "Couldn't update your display name. Try again.",
        );
        return;
      }
    }

    if (emailChanged) {
      const response = await apiClient.account["change-email"].$post({
        json: {
          newEmail: nextEmail,
        },
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          getResponseMessage(
            payload,
            "Couldn't update your email address. Try again.",
          ),
        );
        return;
      }

      if (
        payload &&
        typeof payload === "object" &&
        "emailUpdated" in payload &&
        payload.emailUpdated === false &&
        "currentEmail" in payload &&
        typeof payload.currentEmail === "string" &&
        "pendingEmail" in payload &&
        (typeof payload.pendingEmail === "string" ||
          payload.pendingEmail === null)
      ) {
        const currentEmailForApproval = payload.currentEmail;
        const pendingEmailForApproval = payload.pendingEmail;
        const nextSavedProfile = {
          ...savedProfile,
          name: nextName,
        };

        setSavedProfile(nextSavedProfile);
        setCurrentPendingEmail(pendingEmailForApproval);
        form.setValue("email", currentEmailForApproval, {
          shouldDirty: false,
        });
        toast.success(
          `We sent an approval email to ${currentEmailForApproval}. Open that inbox to approve switching to ${pendingEmailForApproval}.`,
        );

        startTransition(() => {
          form.reset({
            email: currentEmailForApproval,
            name: nextSavedProfile.name,
          });
        });

        return;
      }

      const nextSavedProfile = {
        email: nextEmail,
        emailVerified: false,
        name: nextName,
      };

      setSavedProfile(nextSavedProfile);
      setCurrentPendingEmail(null);

      const verificationEmailSent =
        payload &&
        typeof payload === "object" &&
        "verificationEmailSent" in payload &&
        payload.verificationEmailSent !== false;

      if (verificationEmailSent) {
        toast.success(
          "Your email was updated. Check your inbox for the verification link.",
        );
      } else {
        toast.info(
          "Your email was updated, but we couldn't send the verification email automatically. Use the resend button below.",
        );
      }

      startTransition(() => {
        form.reset({
          email: nextSavedProfile.email,
          name: nextSavedProfile.name,
        });
      });

      return;
    }

    const nextSavedProfile = {
      ...savedProfile,
      name: nextName,
    };

    setSavedProfile(nextSavedProfile);
    toast.success("Your profile details were updated.");

    startTransition(() => {
      form.reset({
        email: nextSavedProfile.email,
        name: nextSavedProfile.name,
      });
    });
  }

  async function onResendVerification() {
    setIsResendingVerification(true);

    try {
      const response = await apiClient.account["resend-verification"].$post();
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(
          getResponseMessage(
            payload,
            "Couldn't resend the verification email. Try again.",
          ),
        );
        return;
      }

      const emailAddress =
        payload &&
        typeof payload === "object" &&
        "email" in payload &&
        typeof payload.email === "string"
          ? payload.email
          : savedProfile.email;

      toast.success(`We sent another verification email to ${emailAddress}.`);
    } finally {
      setIsResendingVerification(false);
    }
  }

  const emailStatusLabel = savedProfile.emailVerified
    ? "Verified"
    : "Unverified";
  const emailDescription = currentPendingEmail
    ? `We sent an approval email to ${savedProfile.email}. Open that inbox to approve switching this account to ${currentPendingEmail}.`
    : savedProfile.emailVerified
      ? "Changing your email? We'll send a link to your current inbox to confirm before switching."
      : "This email address is unverified. Resend the verification link if you need another copy.";

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
      noValidate
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={nameId}>Display Name</FieldLabel>
          <FieldContent>
            <Input
              id={nameId}
              placeholder="Your name"
              aria-invalid={!!errors.name}
              disabled={isBusy}
              {...form.register("name")}
            />
          </FieldContent>
          <FieldDescription>
            How your name appears across the app.
          </FieldDescription>
          <FieldErrorComponent errors={errors.name ? [errors.name] : []} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-x-2">
              <FieldLabel htmlFor={emailId}>Email Address</FieldLabel>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {emailStatusLabel}
              </span>
            </div>

            {!savedProfile.emailVerified && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-xs"
                onClick={() => void onResendVerification()}
                disabled={isBusy}
              >
                <Mail className="h-3.5 w-3.5" />
                {isResendingVerification
                  ? "Sending verification..."
                  : "Resend verification"}
              </Button>
            )}
          </div>

          <FieldContent>
            <Input
              id={emailId}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              disabled={isBusy}
              {...form.register("email")}
            />
          </FieldContent>

          <FieldDescription>{emailDescription}</FieldDescription>
          <FieldErrorComponent errors={errors.email ? [errors.email] : []} />
        </Field>
      </FieldGroup>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isBusy}>
          {isSubmitting ? "Saving changes..." : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isBusy}
          onClick={() => {
            form.reset({
              email: savedProfile.email,
              name: savedProfile.name,
            });
          }}
        >
          Reset
        </Button>
      </div>
    </form>
  );
}
