import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/forms/reset-password";

export default function ResetPasswordPage() {
  return (
    <div>
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
