import { Text } from "@react-email/components";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { EmailLayout } from "../../components/email-layout";

interface SubmissionRejectedProps {
  name: string;
  submissionName: string;
  submissionType: string;
  rejectionReason: string;
}

export default function SubmissionRejectedTemplate({
  name,
  submissionName,
  submissionType,
  rejectionReason,
}: SubmissionRejectedProps) {
  return (
    <EmailLayout
      preview={`Your ${submissionType} "${submissionName}" needs some changes on ${siteConfig.name}`}
    >
      <Text style={styles.heading}>Submission needs changes</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        Thanks for submitting your {submissionType}{" "}
        <strong>&ldquo;{submissionName}&rdquo;</strong>. After review, we
        weren't able to approve it at this time.
      </Text>
      <Text style={styles.reasonLabel}>Reason from our team:</Text>
      <Text style={styles.reason}>{rejectionReason}</Text>
      <Text style={styles.body}>
        You're welcome to update your submission and resubmit once you've
        addressed the feedback. Log in to your dashboard to make changes.
      </Text>
      <Text style={styles.disclaimer}>
        If you have any questions, reply to this email or reach out to{" "}
        {siteConfig.contact.support}.
      </Text>
    </EmailLayout>
  );
}

const styles = {
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 20px",
  },
  body: {
    fontSize: "15px",
    color: "#3f3f46",
    lineHeight: "1.6",
    margin: "0 0 12px",
  },
  reasonLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#3f3f46",
    margin: "16px 0 6px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  reason: {
    fontSize: "15px",
    color: "#3f3f46",
    lineHeight: "1.6",
    margin: "0 0 20px",
    padding: "16px",
    backgroundColor: "#f4f4f5",
    borderRadius: "6px",
    borderLeft: "3px solid #e4e4e7",
  },
  disclaimer: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0",
  },
} satisfies Record<string, React.CSSProperties>;
