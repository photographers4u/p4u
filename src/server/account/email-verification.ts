import { createEmailVerificationToken } from "better-auth/api";
import { getSafeAuthCallbackUrl } from "@/lib/auth-redirect";
import { env } from "@/lib/env";
import { auth } from "@/server/auth";
import { email } from "@/server/email";

const DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN_SECONDS = 60 * 60;

type SendVerificationEmailResult =
  | {
      kind: "error";
    }
  | {
      kind: "success";
    };

type PublicVerificationEmailResult =
  | {
      kind: "error";
      message: string;
      statusCode: 500;
    }
  | {
      kind: "success";
    };

export type PublicRegistrationEmailStatus =
  | "available"
  | "existing_unverified"
  | "existing_verified";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getEmailDisplayName(
  name: string | null | undefined,
  emailAddress: string,
) {
  const trimmedName = name?.trim();

  if (trimmedName) {
    return trimmedName;
  }

  return emailAddress.split("@")[0] ?? "there";
}

function buildVerifyEmailURL(token: string, callbackURL?: string) {
  const verificationURL = new URL(
    "/api/auth/verify-email",
    env.NEXT_PUBLIC_BASE_URL,
  );
  verificationURL.searchParams.set("token", token);
  verificationURL.searchParams.set(
    "callbackURL",
    getSafeAuthCallbackUrl(callbackURL),
  );

  return verificationURL.toString();
}

export async function sendVerificationEmailToUser(params: {
  callbackURL?: string;
  emailAddress: string;
  name: string;
}): Promise<SendVerificationEmailResult> {
  const authContext = await auth.$context;
  const configuredExpiresIn = (
    authContext.options.emailVerification as { expiresIn?: number } | undefined
  )?.expiresIn;

  try {
    const token = await createEmailVerificationToken(
      authContext.secret,
      params.emailAddress,
      undefined,
      configuredExpiresIn ?? DEFAULT_EMAIL_VERIFICATION_EXPIRES_IN_SECONDS,
    );

    await email.sendVerifyEmail(params.emailAddress, {
      name: params.name,
      url: buildVerifyEmailURL(token, params.callbackURL),
    });

    return { kind: "success" };
  } catch (error) {
    authContext.logger.error(
      error instanceof Error
        ? error.message
        : "Failed to send verification email.",
    );

    return { kind: "error" };
  }
}

export async function resendVerificationEmailForPublicUser(params: {
  callbackURL?: string;
  email: string;
}): Promise<PublicVerificationEmailResult> {
  const authContext = await auth.$context;
  const normalizedEmail = normalizeEmail(params.email);
  const existingUser =
    await authContext.internalAdapter.findUserByEmail(normalizedEmail);

  if (!existingUser || existingUser.user.emailVerified) {
    return {
      kind: "success",
    };
  }

  const result = await sendVerificationEmailToUser({
    callbackURL: params.callbackURL,
    emailAddress: existingUser.user.email,
    name: getEmailDisplayName(existingUser.user.name, existingUser.user.email),
  });

  if (result.kind === "error") {
    return {
      kind: "error",
      message: "We couldn't send the verification email. Please try again.",
      statusCode: 500,
    };
  }

  return {
    kind: "success",
  };
}

export async function getPublicRegistrationEmailStatus(params: {
  email: string;
}): Promise<PublicRegistrationEmailStatus> {
  const authContext = await auth.$context;
  const normalizedEmail = normalizeEmail(params.email);
  const existingUser =
    await authContext.internalAdapter.findUserByEmail(normalizedEmail);

  if (!existingUser) {
    return "available";
  }

  return existingUser.user.emailVerified
    ? "existing_verified"
    : "existing_unverified";
}
