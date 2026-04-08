"use client";

import Link from "next/link";
import { useState } from "react";
import { FieldSeparator } from "@/components/ui/field";
import {
  AuthContainer,
  AuthModeToggle,
  type ModeToggleProps,
} from "../../auth-ui";
import { MagicLinkForm } from "../magic-link";
import { RegisterFields } from "./fields";

export const RegisterForm = () => {
  const [mode, setMode] = useState<ModeToggleProps["mode"]>("email-password");

  return (
    <AuthContainer
      title="Create your account"
      subtitle={
        mode === "magic"
          ? "We'll email you a secure link to get started."
          : "Sign up with your email and password."
      }
    >
      <div className="flex flex-col gap-6">
        {mode === "email-password" ? <RegisterFields /> : <MagicLinkForm />}

        <FieldSeparator>or</FieldSeparator>

        <AuthModeToggle mode={mode} onChange={setMode} />

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
      <div className="px-2 text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy-policy" className="underline underline-offset-4">
          Privacy Policy
        </Link>
        .
      </div>
    </AuthContainer>
  );
};
