"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";
import { AuthContainer } from "@/components/auth-ui";
import { Button } from "@/components/ui/button";
import {
  buildAuthRedirectPath,
  DEFAULT_AUTH_CALLBACK_URL,
  getSafeAuthCallbackUrl,
} from "@/lib/auth-redirect";
import { readApiResponse } from "@/lib/api-response";

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
  description: "Open the verification link from your inbox to finish setting up your account.",
  tone: "info",
};

function getState(error: string | null, status: string | null) {
  if (error) return stateByErrorCode[error] ?? defaultErrorState;
  if (status === "success") return successState;
  return idleState;
}

function getVerificationIntent(intent: string | null) {
  if (intent === "signin" || intent === "signup") {
    return intent;
  }

  return null;
}

function getResendMessageEmail(
  email: string | null,
  intent: "signin" | "signup" | null,
) {
  if (!email) {
    return "Add the email address you used to sign up to request another verification link.";
  }

  if (intent === "signup") {
    return `If an unverified account exists for ${email}, check your inbox for a verification link to finish setting up your account.`;
  }

  if (intent === "signin") {
    return `${email} still needs verification before you can sign in with a password. Check your inbox for the latest link or request another one here.`;
  }

  return `We can resend a verification link to ${email}.`;
}

function EmailVerificationContent() {
  const searchParams = useSearchParams();
  const callbackUrl = getSafeAuthCallbackUrl(searchParams.get("callbackUrl"));
  const error = searchParams.get("error");
  const status = searchParams.get("status");
  const email = searchParams.get("email")?.trim().toLowerCase() ?? null;
  const intent = getVerificationIntent(searchParams.get("intent"));
  const state = getState(error, status);
  const [isResending, setIsResending] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const primaryHref =
    state.tone === "success"
      ? callbackUrl
      : buildAuthRedirectPath("/login", {
          callbackUrl:
            callbackUrl === DEFAULT_AUTH_CALLBACK_URL ? undefined : callbackUrl,
        });
  const primaryLabel =
    state.tone === "success" ? "Continue to account" : "Back to sign in";
  const canResend = state.tone !== "success" && !!email;

  const resendDescription = useMemo(() => {
    if (status === "success") {
      return "Your email is already verified, so you can head straight into your account.";
    }

    return getResendMessageEmail(email, intent);
  }, [email, intent, status]);

  async function onResend() {
    if (!email || isResending) {
      return;
    }

    setIsResending(true);
    setResendNotice(null);

    try {
      const response = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email,
          callbackURL: callbackUrl,
        }),
      });
      const { errorMessage } = await readApiResponse(response);

      if (!response.ok) {
        const message =
          errorMessage ?? "We couldn't resend the verification email.";
        setResendNotice(message);
        toast.error(message);
        return;
      }

      const message = `If an unverified account exists for ${email}, a fresh verification link will arrive shortly.`;
      setResendNotice(message);
      toast.success(message);
    } catch {
      const message = "We couldn't resend the verification email.";
      setResendNotice(message);
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthContainer title={state.title} subtitle={state.description}>
      <div className="flex flex-col gap-6">
        <div className="rounded-3xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          <p>{resendDescription}</p>
          {email ? (
            <p className="mt-2 font-medium text-foreground">{email}</p>
          ) : null}
          {resendNotice ? <p className="mt-3">{resendNotice}</p> : null}
        </div>

        {canResend ? (
          <Button onClick={onResend} disabled={isResending} className="w-full">
            {isResending
              ? "Sending verification email..."
              : "Resend verification email"}
          </Button>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button asChild variant="secondary" className="w-full">
            <Link href="/">
              <ChevronLeft /> Home
            </Link>
          </Button>
          <Button asChild>
            <Link href={primaryHref} className="text-white! w-full">
              {primaryLabel}
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
