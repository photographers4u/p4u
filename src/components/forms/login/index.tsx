"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AuthContainer,
  AuthModeToggle,
  type ModeToggleProps,
} from "@/components/auth-ui";
import { LoginFields } from "@/components/forms/login/fields";
import { MagicLinkForm } from "@/components/forms/magic-link";
import { FieldSeparator } from "@/components/ui/field";

export const LoginForm = ({
  callbackUrl = "/account",
}: {
  callbackUrl?: string;
}) => {
  const [mode, setMode] = useState<ModeToggleProps["mode"]>("email-password");

  return (
    <AuthContainer
      title="Welcome back"
      subtitle={
        mode === "magic"
          ? "We'll send you a secure link to sign in."
          : "Enter your email and password to continue."
      }
    >
      <div className="flex flex-col gap-6">
        {mode === "email-password" ? (
          <LoginFields callbackUrl={callbackUrl} />
        ) : (
          <MagicLinkForm callbackUrl={callbackUrl} />
        )}

        <FieldSeparator>or</FieldSeparator>

        <AuthModeToggle mode={mode} onChange={setMode} />

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-foreground underline underline-offset-4"
          >
            Create one
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
};
