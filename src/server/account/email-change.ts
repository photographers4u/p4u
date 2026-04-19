import { z } from "zod";
import { env } from "@/lib/env";
import { auth } from "@/server/auth";
import { email } from "@/server/email";
import { sendVerificationEmailToUser } from "./email-verification";

const EMAIL_CHANGE_EXPIRES_IN_SECONDS = 60 * 60;
const EMAIL_VERIFICATION_SUCCESS_CALLBACK_URL =
  "/email-verification?status=success";

const changeEmailSchema = z.object({
  newEmail: z.string().trim().email("Enter a valid email address."),
});

const confirmEmailChangePayloadSchema = z.object({
  currentEmail: z.string().email(),
  newEmail: z.string().email(),
  userId: z.string().min(1),
});

type FreshSession = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

type ResultError = {
  kind: "error";
  message: string;
  statusCode: 400 | 500;
};

type ResultUnauthorized = {
  kind: "unauthorized";
};

type ChangeEmailSuccess = {
  currentEmail: string;
  emailUpdated: boolean;
  emailVerified: boolean;
  pendingEmail: string | null;
  verificationEmailSent: boolean | null;
};

type ChangeEmailResult =
  | ResultError
  | ResultUnauthorized
  | {
      kind: "success";
      value: ChangeEmailSuccess;
    };

type PendingEmailChangeResult =
  | ResultUnauthorized
  | {
      kind: "success";
      value: {
        pendingEmail: string | null;
      };
    };

type ResendVerificationResult =
  | ResultError
  | ResultUnauthorized
  | {
      kind: "success";
      value: {
        email: string;
      };
    };

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getPendingEmailChangeIdentifier(userId: string) {
  return `pending-email-change:${userId}`;
}

function getConfirmEmailChangeIdentifier(token: string) {
  return `confirm-email-change:${token}`;
}

function getAccountURL(
  params?: Record<string, string | undefined>,
  path = "/account",
) {
  const url = new URL(path, env.NEXT_PUBLIC_BASE_URL);

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

function getConfirmEmailChangeURL(token: string) {
  const url = new URL(
    "/api/account/confirm-email-change",
    env.NEXT_PUBLIC_BASE_URL,
  );
  url.searchParams.set("token", token);
  return url.toString();
}

async function getFreshSession(headers: Headers) {
  return auth.api.getSession({
    headers,
    query: {
      disableCookieCache: true,
    },
  });
}

async function readPendingEmailChange(
  session: FreshSession,
): Promise<string | null> {
  const authContext = await auth.$context;
  const identifier = getPendingEmailChangeIdentifier(session.user.id);
  const pendingEmailChange =
    await authContext.internalAdapter.findVerificationValue(identifier);

  if (!pendingEmailChange) {
    return null;
  }

  if (pendingEmailChange.expiresAt < new Date()) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      identifier,
    );
    return null;
  }

  if (
    normalizeEmail(pendingEmailChange.value) ===
    normalizeEmail(session.user.email)
  ) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      identifier,
    );
    return null;
  }

  return pendingEmailChange.value;
}

export async function getPendingEmailChangeState(params: {
  headers: Headers;
}): Promise<PendingEmailChangeResult> {
  const session = await getFreshSession(params.headers);

  if (!session) {
    return {
      kind: "unauthorized",
    };
  }

  return {
    kind: "success",
    value: {
      pendingEmail: await readPendingEmailChange(session),
    },
  };
}

export async function changeAccountEmail(params: {
  body: unknown;
  headers: Headers;
}): Promise<ChangeEmailResult> {
  const parsedBody = changeEmailSchema.safeParse(params.body);

  if (!parsedBody.success) {
    return {
      kind: "error",
      message:
        parsedBody.error.issues[0]?.message ?? "Enter a valid email address.",
      statusCode: 400,
    };
  }

  const session = await getFreshSession(params.headers);

  if (!session) {
    return {
      kind: "unauthorized",
    };
  }

  const authContext = await auth.$context;
  const newEmail = normalizeEmail(parsedBody.data.newEmail);
  const currentEmail = normalizeEmail(session.user.email);
  const pendingIdentifier = getPendingEmailChangeIdentifier(session.user.id);

  if (!authContext.options.user?.changeEmail?.enabled) {
    return {
      kind: "error",
      message: "Email changes are disabled for this account.",
      statusCode: 400,
    };
  }

  if (newEmail === currentEmail) {
    return {
      kind: "error",
      message: "That email address is already on your account.",
      statusCode: 400,
    };
  }

  const existingUser =
    await authContext.internalAdapter.findUserByEmail(newEmail);

  if (existingUser && existingUser.user.id !== session.user.id) {
    return {
      kind: "error",
      message: "That email address is already in use.",
      statusCode: 400,
    };
  }

  if (session.user.emailVerified) {
    const confirmationToken = crypto.randomUUID();
    const confirmationIdentifier =
      getConfirmEmailChangeIdentifier(confirmationToken);

    try {
      await authContext.internalAdapter.createVerificationValue({
        identifier: confirmationIdentifier,
        value: JSON.stringify({
          currentEmail: session.user.email,
          newEmail,
          userId: session.user.id,
        }),
        expiresAt: new Date(
          Date.now() + EMAIL_CHANGE_EXPIRES_IN_SECONDS * 1000,
        ),
      });

      await authContext.internalAdapter.deleteVerificationByIdentifier(
        pendingIdentifier,
      );

      await authContext.internalAdapter.createVerificationValue({
        identifier: pendingIdentifier,
        value: newEmail,
        expiresAt: new Date(
          Date.now() + EMAIL_CHANGE_EXPIRES_IN_SECONDS * 1000,
        ),
      });

      await email.sendEmailChange(session.user.email, {
        name: session.user.name,
        newEmail,
        url: getConfirmEmailChangeURL(confirmationToken),
      });
    } catch (error) {
      await authContext.internalAdapter.deleteVerificationByIdentifier(
        confirmationIdentifier,
      );
      await authContext.internalAdapter.deleteVerificationByIdentifier(
        pendingIdentifier,
      );

      authContext.logger.error(
        error instanceof Error
          ? error.message
          : "Failed to send the email change approval email.",
      );

      return {
        kind: "error",
        message: "We couldn't send the approval email. Please try again.",
        statusCode: 500,
      };
    }

    return {
      kind: "success",
      value: {
        currentEmail: session.user.email,
        emailUpdated: false,
        emailVerified: true,
        pendingEmail: newEmail,
        verificationEmailSent: null,
      },
    };
  }

  const updatedUser = await authContext.internalAdapter.updateUserByEmail(
    session.user.email,
    {
      email: newEmail,
      emailVerified: false,
    },
  );

  await authContext.internalAdapter.deleteVerificationByIdentifier(
    pendingIdentifier,
  );

  const verificationEmailResult = await sendVerificationEmailToUser({
    callbackURL: EMAIL_VERIFICATION_SUCCESS_CALLBACK_URL,
    emailAddress: newEmail,
    name: updatedUser.name,
  });

  return {
    kind: "success",
    value: {
      currentEmail: newEmail,
      emailUpdated: true,
      emailVerified: false,
      pendingEmail: null,
      verificationEmailSent: verificationEmailResult.kind === "success",
    },
  };
}

export async function resendAccountVerification(params: {
  headers: Headers;
}): Promise<ResendVerificationResult> {
  const session = await getFreshSession(params.headers);

  if (!session) {
    return {
      kind: "unauthorized",
    };
  }

  if (session.user.emailVerified) {
    return {
      kind: "error",
      message: "This email address is already verified.",
      statusCode: 400,
    };
  }

  const result = await sendVerificationEmailToUser({
    callbackURL: EMAIL_VERIFICATION_SUCCESS_CALLBACK_URL,
    emailAddress: session.user.email,
    name: session.user.name,
  });

  if (result.kind === "error") {
    return {
      kind: "error",
      message: "We couldn't resend the verification email. Please try again.",
      statusCode: 500,
    };
  }

  return {
    kind: "success",
    value: {
      email: session.user.email,
    },
  };
}

export async function resolveEmailChangeConfirmationRedirectURL(params: {
  headers: Headers;
  token: string;
}) {
  const authContext = await auth.$context;
  const confirmationIdentifier = getConfirmEmailChangeIdentifier(params.token);
  const confirmation = await authContext.internalAdapter.findVerificationValue(
    confirmationIdentifier,
  );

  if (!confirmation || confirmation.expiresAt < new Date()) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return getAccountURL({
      emailChangeError: "invalid-link",
    });
  }

  let payload: unknown = null;

  try {
    payload = JSON.parse(confirmation.value);
  } catch {
    payload = null;
  }

  const parsedPayload = confirmEmailChangePayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return getAccountURL({
      emailChangeError: "invalid-link",
    });
  }

  const { currentEmail, newEmail, userId } = parsedPayload.data;
  const currentUser = await authContext.internalAdapter.findUserById(userId);

  if (
    !currentUser ||
    normalizeEmail(currentUser.email) !== normalizeEmail(currentEmail)
  ) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return getAccountURL({
      emailChangeError: "invalid-link",
    });
  }

  const pendingIdentifier = getPendingEmailChangeIdentifier(userId);
  const pendingChange =
    await authContext.internalAdapter.findVerificationValue(pendingIdentifier);

  if (
    !pendingChange ||
    normalizeEmail(pendingChange.value) !== normalizeEmail(newEmail)
  ) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );

    return getAccountURL({
      emailChangeError: "stale-request",
    });
  }

  const session = await getFreshSession(params.headers);

  if (session && session.user.id !== userId) {
    return getAccountURL({
      emailChangeError: "invalid-session",
    });
  }

  const existingUser =
    await authContext.internalAdapter.findUserByEmail(newEmail);

  if (existingUser && existingUser.user.id !== userId) {
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      confirmationIdentifier,
    );
    await authContext.internalAdapter.deleteVerificationByIdentifier(
      pendingIdentifier,
    );

    return getAccountURL({
      emailChangeError: "email-in-use",
    });
  }

  const updatedUser = await authContext.internalAdapter.updateUserByEmail(
    currentEmail,
    {
      email: newEmail,
      emailVerified: false,
    },
  );

  await authContext.internalAdapter.deleteVerificationByIdentifier(
    confirmationIdentifier,
  );
  await authContext.internalAdapter.deleteVerificationByIdentifier(
    pendingIdentifier,
  );

  const verificationEmailResult = await sendVerificationEmailToUser({
    callbackURL: EMAIL_VERIFICATION_SUCCESS_CALLBACK_URL,
    emailAddress: updatedUser.email,
    name: updatedUser.name,
  });

  return getAccountURL({
    emailChanged: "1",
    verificationEmailSent:
      verificationEmailResult.kind === "success" ? "1" : "0",
  });
}

export function getEmailChangeErrorMessage(code: string | undefined) {
  switch (code) {
    case "email-in-use":
      return "That new email address is already being used by another account.";
    case "invalid-link":
      return "This email-change link is invalid or has expired.";
    case "invalid-session":
      return "Open this link while signed into the same account that requested the change.";
    case "stale-request":
      return "This approval link is no longer current. Request the email change again.";
    default:
      return null;
  }
}
