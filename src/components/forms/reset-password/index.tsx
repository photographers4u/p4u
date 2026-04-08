"use client";

import Link from "next/link";
import { redirect, useSearchParams } from "next/navigation";
import { AuthContainer } from "../../auth-ui";
import { ResetPasswordFields } from "./fields";

export const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  if (!token) redirect("/forgot-password");
  return (
    <AuthContainer
      title="Enter a new password"
      subtitle="Set a new password for your account."
    >
      <div className="flex flex-col gap-6">
        <ResetPasswordFields token={token} />

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
