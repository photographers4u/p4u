import { Button, Section, Text } from "@react-email/components";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { EmailLayout } from "../../components/email-layout";

interface SubmissionApprovedProps {
  name: string;
  submissionName: string;
  submissionType: string;
  viewUrl: string;
}

export default function SubmissionApprovedTemplate({
  name,
  submissionName,
  submissionType,
  viewUrl,
}: SubmissionApprovedProps) {
  return (
    <EmailLayout
      preview={`Your ${submissionType} "${submissionName}" has been approved on ${siteConfig.name}`}
    >
      <Text style={styles.heading}>You're live!</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        Great news - your {submissionType}{" "}
        <strong>&ldquo;{submissionName}&rdquo;</strong> has been reviewed,
        approved, and is now live on {siteConfig.name}.
      </Text>
      <Section style={styles.buttonSection}>
        <Button href={viewUrl} style={styles.button}>
          Review your {submissionType}
        </Button>
      </Section>
      <Text style={styles.disclaimer}>
        Thanks for contributing to the community. You can keep your details up
        to date from your dashboard any time.
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
