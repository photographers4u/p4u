import { env } from "@/lib/env";
import { userDal } from "@/server/db/dal/user";
import { resend } from "../client";
import { EmailSendError } from "../errors";
import SubmissionApprovedTemplate from "../templates/review/submission-approved";
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

/**
 * Looks up the user by ID and sends the appropriate review notification.
 * Silently no-ops if the user cannot be found.
 */
export async function notifySubmissionReviewed({
  userId,
  status,
  submissionName,
  submissionType,
  slug,
  rejectionReason,
}: {
  userId: string;
  status: "approved" | "rejected";
  submissionName: string;
  submissionType: string;
  slug: string;
  rejectionReason?: string;
}) {
  const user = await userDal.getUserById(userId);
  if (!user) return;

  if (status === "approved") {
    const viewUrl = `${env.NEXT_PUBLIC_BASE_URL}/${submissionType}s/${slug}`;
    await sendSubmissionApproved(user.email, {
      name: user.name,
      submissionName,
      submissionType,
      viewUrl,
    });
  } else {
    await sendSubmissionRejected(user.email, {
      name: user.name,
      submissionName,
      submissionType,
      rejectionReason: rejectionReason ?? "No reason provided.",
    });
  }
}
