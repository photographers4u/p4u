"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthContainer } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";

type VerificationState = {
  description: string;
  eyebrow: string;
  title: string;
  tone: "error" | "info" | "success";
};

const stateByErrorCode: Record<string, VerificationState> = {
  INVALID_TOKEN: {
    eyebrow: "Verification error",
    title: "This link is invalid",
    description:
      "The link may be broken or already used. Request a new one and try again.",
    tone: "error",
  },
  TOKEN_EXPIRED: {
    eyebrow: "Verification error",
    title: "This link has expired",
    description:
      "Verification links only stay active for a limited time. Request a new one.",
    tone: "error",
  },
  USER_NOT_FOUND: {
    eyebrow: "Verification error",
    title: "Account not found",
    description:
      "This link no longer matches an account. Try signing in again.",
    tone: "error",
  },
  INVALID_USER: {
    eyebrow: "Verification error",
    title: "Wrong account",
    description: "Open this link while signed into the correct account.",
    tone: "error",
  },
};

const defaultErrorState: VerificationState = {
  eyebrow: "Verification error",
  title: "We couldn't verify your email",
  description: "Try using the latest email or request a new link.",
  tone: "error",
};

const successState: VerificationState = {
  eyebrow: "Email verified",
  title: "You're all set",
  description: "Your email is verified. You can continue.",
  tone: "success",
};

const idleState: VerificationState = {
  eyebrow: "Email verification",
  title: "Check your email",
  description: "Open the verification link from your inbox.",
  tone: "info",
};

function getState(error: string | null, status: string | null) {
  if (error) return stateByErrorCode[error] ?? defaultErrorState;
  if (status === "success") return successState;
  return idleState;
}

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const status = searchParams.get("status");
  const state = getState(error, status);

  return (
    <AuthContainer title={state.title} subtitle={state.description}>
      <div className="flex flex-col gap-6">
        <div className="pt-4 grid grid-cols-2 gap-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/">
              <ChevronLeft /> Home
            </Link>
          </Button>
          <Button asChild disabled={state.tone === "error"}>
            <Link href="/account" className="text-white! w-full">
              Continue
            </Link>
          </Button>
        </div>
      </div>
    </AuthContainer>
  );
}

export default function EmailVerificationPage() {
  return (
    <Suspense>
      <EmailVerificationContent />
    </Suspense>
  );
}
