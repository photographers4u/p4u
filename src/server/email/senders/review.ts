import { env } from "@/lib/env";
import { userDal } from "@/server/db/dal/user";
import { resend } from "../client";
import { EmailSendError } from "../errors";
import SubmissionApprovedTemplate from "../templates/review/submission-approved";
import SubmissionOnHoldTemplate from "../templates/review/submission-on-hold";
import SubmissionRejectedTemplate from "../templates/review/submission-rejected";

const FROM = `${env.EMAIL_FROM_NAME} <${env.EMAIL_FROM_ADDRESS}>`;

export async function sendSubmissionApproved(
  to: string,
  props: {
    name: string;
    submissionName: string;
    submissionType: string;
    viewUrl: string;
  },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${props.submissionType} "${props.submissionName}" is now live`,
    react: SubmissionApprovedTemplate(props),
  });

  if (error) throw new EmailSendError("submission-approved", to, error);
  return data;
}

export async function sendSubmissionRejected(
  to: string,
  props: {
    name: string;
    reviewUrl: string;
    submissionName: string;
    submissionType: string;
    rejectionReason: string;
  },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${props.submissionType} "${props.submissionName}" needs changes`,
    react: SubmissionRejectedTemplate(props),
  });

  if (error) throw new EmailSendError("submission-rejected", to, error);
  return data;
}

export async function sendSubmissionOnHold(
  to: string,
  props: {
    holdReason: string;
    name: string;
    reviewUrl: string;
    submissionName: string;
    submissionType: string;
  },
) {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: `Your ${props.submissionType} "${props.submissionName}" is on hold`,
    react: SubmissionOnHoldTemplate(props),
  });

  if (error) throw new EmailSendError("submission-on-hold", to, error);
  return data;
}

/**
 * Looks up the user by ID and sends the appropriate review notification.
 * Silently no-ops if the user cannot be found.
 */
export async function notifySubmissionReviewed({
  userId,
  status,
  reviewUrl,
  submissionName,
  submissionType,
  rejectionReason,
}: {
  userId: string;
  status: "approved" | "rejected" | "on_hold";
  reviewUrl: string;
  submissionName: string;
  submissionType: string;
  rejectionReason?: string;
}) {
  const user = await userDal.getUserById(userId);
  if (!user) return;

  if (status === "approved") {
    await sendSubmissionApproved(user.email, {
      name: user.name,
      submissionName,
      submissionType,
      viewUrl: reviewUrl,
    });
  } else if (status === "on_hold") {
    await sendSubmissionOnHold(user.email, {
      holdReason: rejectionReason ?? "No reason provided.",
      name: user.name,
      reviewUrl,
      submissionName,
      submissionType,
    });
  } else {
    await sendSubmissionRejected(user.email, {
      name: user.name,
      reviewUrl,
      submissionName,
      submissionType,
      rejectionReason: rejectionReason ?? "No reason provided.",
    });
  }
}
