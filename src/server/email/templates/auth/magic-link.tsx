import { Button, Section, Text } from "@react-email/components";
import type * as React from "react";
import { siteConfig } from "@/config/site";
import { EmailLayout } from "../../components/email-layout";

interface MagicLinkProps {
  url: string;
}

export default function MagicLinkTemplate({ url }: MagicLinkProps) {
  return (
    <EmailLayout preview={`Your sign-in link for ${siteConfig.name}`}>
      <Text style={styles.heading}>Sign in to {siteConfig.name}</Text>
      <Text style={styles.body}>
        Click the button below to sign in. This link expires in 10 minutes and
        can only be used once.
      </Text>
      <Section style={styles.buttonSection}>
        <Button href={url} style={styles.button}>
          Sign in
        </Button>
      </Section>
      <Text style={styles.disclaimer}>
        If you didn't request this link, you can safely ignore this email.
        Someone may have entered your email address by mistake.
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
