import { Button, Section, Text } from "@react-email/components";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { EmailLayout } from "../../components/email-layout";

interface SubmissionOnHoldProps {
  holdReason: string;
  name: string;
  reviewUrl: string;
  submissionName: string;
  submissionType: string;
}

export default function SubmissionOnHoldTemplate({
  holdReason,
  name,
  reviewUrl,
  submissionName,
  submissionType,
}: SubmissionOnHoldProps) {
  return (
    <EmailLayout
      preview={`Your ${submissionType} "${submissionName}" is on hold on ${siteConfig.name}`}
    >
      <Text style={styles.heading}>Submission on hold</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        We reviewed your {submissionType}{" "}
        <strong>&ldquo;{submissionName}&rdquo;</strong> and put it on hold for
        now.
      </Text>
      <Text style={styles.reasonLabel}>Reason from our team:</Text>
      <Text style={styles.reason}>{holdReason}</Text>
      <Section style={styles.buttonSection}>
        <Button href={reviewUrl} style={styles.button}>
          Review your {submissionType}
        </Button>
      </Section>
      <Text style={styles.body}>
        Your {submissionType} is hidden while the hold is active. You can
        review the current feedback from your dashboard, and we'll share next
        steps once a resubmission flow is available.
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
  buttonSection: {
    margin: "28px 0",
  },
  button: {
    backgroundColor: "#1a1a1a",
    borderRadius: "6px",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    padding: "12px 24px",
    textDecoration: "none",
  },
  disclaimer: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0",
  },
} satisfies Record<string, React.CSSProperties>;
