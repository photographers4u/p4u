import { Button, Section, Text } from "@react-email/components";
import type * as React from "react";
import { EmailLayout } from "../../components/email-layout";

interface EmailChangeProps {
  name: string;
  newEmail: string;
  url: string;
}

export default function EmailChangeTemplate({
  name,
  newEmail,
  url,
}: EmailChangeProps) {
  return (
    <EmailLayout preview="Confirm your new email address">
      <Text style={styles.heading}>Confirm email change</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        A request was made to change the email address on your account to:
      </Text>
      <Section style={styles.emailBadge}>
        <Text style={styles.emailBadgeText}>{newEmail}</Text>
      </Section>
      <Text style={styles.body}>
        Click the button below to approve this change. This link expires in 1
        hour.
      </Text>
      <Section style={styles.buttonSection}>
        <Button href={url} style={styles.button}>
          Approve email change
        </Button>
      </Section>
      <Text style={styles.disclaimer}>
        If you didn't request this change, you can safely ignore this email.
        Your current email address will remain unchanged.
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
  emailBadge: {
    backgroundColor: "#f4f4f5",
    borderRadius: "6px",
    margin: "4px 0 16px",
    padding: "12px 16px",
  },
  emailBadgeText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
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
