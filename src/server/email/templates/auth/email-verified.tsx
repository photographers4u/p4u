import { Section, Text } from "@react-email/components";
import type * as React from "react";
import { EmailLayout } from "../../components/email-layout";

interface EmailVerifiedProps {
  name: string;
  email: string;
}

export default function EmailVerifiedTemplate({
  name,
  email,
}: EmailVerifiedProps) {
  return (
    <EmailLayout preview="Your email address has been verified">
      <Text style={styles.heading}>Email verified</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        Your email address has been successfully verified.
      </Text>
      <Section style={styles.emailBadge}>
        <Text style={styles.emailBadgeText}>{email}</Text>
      </Section>
      <Text style={styles.body}>You now have full access to your account.</Text>
      <Text style={styles.disclaimer}>
        If you didn't verify this email address, please contact us immediately.
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
    margin: "20px 0",
    padding: "12px 16px",
  },
  emailBadgeText: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
  },
  disclaimer: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0",
  },
} satisfies Record<string, React.CSSProperties>;
