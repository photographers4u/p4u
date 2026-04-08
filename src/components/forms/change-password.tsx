"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { PasswordField } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

const setSchema = z
  .object({
    newPassword: z.string().min(8, "Must be at least 8 characters"),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ["confirmNewPassword"],
  });

type ChangeValues = z.infer<typeof changeSchema>;
type SetValues = z.infer<typeof setSchema>;
type PasswordState = "loading" | "has-password" | "no-password" | "unknown";

export function ChangePasswordForm() {
  const [passwordState, setPasswordState] = useState<PasswordState>("loading");
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);

  const loadAccounts = useCallback(async () => {
    setAccountsError(null);
    setPasswordState("loading");

    const { data, error } = await authClient.listAccounts();

    if (error || !data) {
      setPasswordState("unknown");
      setAccountsError(
        "We couldn't check whether this account already has a password. Please try again.",
      );
      return;
    }

    setPasswordState(
      data.some((account) => account.providerId === "credential")
        ? "has-password"
        : "no-password",
    );
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const changeForm = useForm<ChangeValues>({
    resolver: zodResolver(changeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  async function onChangePassword(values: ChangeValues) {
    const { error } = await authClient.changePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      revokeOtherSessions: false,
    });

    if (error) {
      toast.error(
        error.code === "INVALID_PASSWORD"
          ? "Your current password is incorrect"
          : "Couldn't update password. Try again.",
      );
      return;
    }

    changeForm.reset();
    toast.success("Password updated successfully.");
  }

  const setForm = useForm<SetValues>({
    resolver: zodResolver(setSchema),
    defaultValues: { newPassword: "", confirmNewPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onBlur",
  });

  async function onSetPassword(values: SetValues) {
    const response = await apiClient.account["set-password"].$post({
      json: { newPassword: values.newPassword },
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      toast.error(
        (payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : null) ?? "Failed to set password. Try again.",
      );
      return;
    }

    setForm.reset();
    toast.success(
      "Password set successfully. You can now sign in with email and password.",
    );
    setPasswordState("has-password");
    setShowSetForm(false);
  }

  if (passwordState === "loading") {
    return <div className="h-52 animate-pulse rounded-[1.25rem] bg-muted/40" />;
  }

  if (passwordState === "unknown") {
    return (
      <div className="space-y-4">
        <div className="rounded-[1.25rem] border border-border bg-muted/40 px-5 py-4 text-sm">
          <p className="font-medium text-foreground">
            Couldn't load your sign-in methods
          </p>
          <p className="mt-1 text-muted-foreground">
            {accountsError ??
              "We couldn't determine whether this account already has a password."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => void loadAccounts()}
        >
          Try again
        </Button>
      </div>
    );
  }

  if (passwordState === "no-password") {
    const {
      formState: { errors, isSubmitting },
    } = setForm;

    return (
      <div className="space-y-5">
        <div className="rounded-[1.25rem] border border-border bg-muted/40 px-5 py-4 text-sm">
          <p className="font-medium text-foreground">No password set up yet</p>
          <p className="mt-1 text-muted-foreground">
            Your account uses magic link sign-in and doesn't have a password.
            Set one up to also sign in with email and password.
          </p>
          {!showSetForm && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setShowSetForm(true)}
            >
              Set password
            </Button>
          )}
        </div>

        {showSetForm && (
          <form
            onSubmit={setForm.handleSubmit(onSetPassword)}
            className="space-y-5"
            noValidate
          >
            <PasswordField
              label="New password"
              placeholder="Enter new password"
              registration={setForm.register("newPassword")}
              error={errors.newPassword}
              description="At least 8 characters"
            />

            <PasswordField
              label="Confirm new password"
              placeholder="Re-enter new password"
              registration={setForm.register("confirmNewPassword")}
              error={errors.confirmNewPassword}
            />

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Setting password..." : "Set password"}
            </Button>
          </form>
        )}
      </div>
    );
  }

  const {
    formState: { errors, isSubmitting },
  } = changeForm;

  return (
    <form
      onSubmit={changeForm.handleSubmit(onChangePassword)}
      className="space-y-5"
      noValidate
    >
      <PasswordField
        label="Current password"
        placeholder="Enter current password"
        registration={changeForm.register("currentPassword")}
        error={errors.currentPassword}
        description="Needed to confirm it's really you"
      />

      <PasswordField
        label="New password"
        placeholder="Enter new password"
        registration={changeForm.register("newPassword")}
        error={errors.newPassword}
        description="At least 8 characters"
      />

      <PasswordField
        label="Confirm new password"
        placeholder="Re-enter new password"
        registration={changeForm.register("confirmNewPassword")}
        error={errors.confirmNewPassword}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving changes..." : "Change password"}
      </Button>
    </form>
  );
}
