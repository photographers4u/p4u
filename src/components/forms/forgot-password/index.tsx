"use client";

import Link from "next/link";
import { AuthContainer } from "../../auth-ui";
import { ForgotPasswordFields } from "./fields";

export const ForgotPasswordForm = () => {
  return (
    <AuthContainer
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
    >
      <div className="flex flex-col gap-6">
        <ForgotPasswordFields />

        <p className="text-center text-sm text-muted-foreground">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="text-foreground underline underline-offset-4"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthContainer>
  );
};
