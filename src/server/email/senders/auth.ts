import { env } from "@/lib/env";
import { resend } from "../client";
import { EmailSendError } from "../errors";
import EmailChangeTemplate from "../templates/auth/email-change";
import EmailVerifiedTemplate from "../templates/auth/email-verified";
import MagicLinkTemplate from "../templates/auth/magic-link";
import PasswordResetTemplate from "../templates/auth/password-reset";
import PasswordResetSuccessTemplate from "../templates/auth/password-reset-success";
import VerifyEmailTemplate from "../templates/auth/verify-email";

const FROM = `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`;

export async function sendVerifyEmail(
  to: string,
  props: { name: string; url: string },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify your email",
    react: VerifyEmailTemplate({ name: props.name, url: props.url }),
  });

  if (error) throw new EmailSendError("verify-email", to, error);
  return data;
}

export async function sendPasswordReset(
  to: string,
  props: { name: string; url: string },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset your password",
    react: PasswordResetTemplate({ name: props.name, url: props.url }),
  });

  if (error) throw new EmailSendError("password-reset", to, error);
  return data;
}

export async function sendEmailVerified(
  to: string,
  props: { name: string; email: string },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Your email has been verified",
    react: EmailVerifiedTemplate({ name: props.name, email: props.email }),
  });

  if (error) throw new EmailSendError("email-verified", to, error);
  return data;
}

export async function sendPasswordResetSuccess(
  to: string,
  props: { name: string },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Your password has been reset",
    react: PasswordResetSuccessTemplate({ name: props.name }),
  });

  if (error) throw new EmailSendError("password-reset-success", to, error);
  return data;
}

export async function sendEmailChange(
  to: string,
  props: { name: string; newEmail: string; url: string },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Confirm your new email address",
    react: EmailChangeTemplate({
      name: props.name,
      newEmail: props.newEmail,
      url: props.url,
    }),
  });

  if (error) throw new EmailSendError("email-change", to, error);
  return data;
}

export async function sendMagicLink(to: string, props: { url: string }) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Your sign-in link",
    react: MagicLinkTemplate({ url: props.url }),
  });

  if (error) throw new EmailSendError("magic-link", to, error);
  return data;
}
