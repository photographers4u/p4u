import { Button, Section, Text } from "@react-email/components";
import type * as React from "react";
import { EmailLayout } from "../../components/email-layout";

interface VerifyEmailProps {
  name: string;
  url: string;
}

export default function VerifyEmailTemplate({ name, url }: VerifyEmailProps) {
  return (
    <EmailLayout preview="Verify your Dezine Mafia email address">
      <Text style={styles.heading}>Verify your email</Text>
      <Text style={styles.body}>Hi {name},</Text>
      <Text style={styles.body}>
        Click the button below to verify your email address. This link expires
        in 1 hour.
      </Text>
      <Section style={styles.buttonSection}>
        <Button href={url} style={styles.button}>
          Verify email
        </Button>
      </Section>
      <Text style={styles.disclaimer}>
        If you didn't create an account, you can safely ignore this email.
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
