import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type * as React from "react";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

interface EmailLayoutProps {
  preview: string;
  children: ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.logo}>{siteConfig.name}</Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.content}>{children}</Section>

          <Hr style={styles.divider} />

          <Section style={styles.signatureSection}>
            <Text style={styles.signatureText}>The {siteConfig.name} team</Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>{siteConfig.name}</Text>
            <Text style={styles.footerText}>
              Questions?{" "}
              <Link
                href={`mailto:${siteConfig.contact.support}`}
                style={styles.footerLink}
              >
                {siteConfig.contact.support}
              </Link>
            </Text>
            <Text style={styles.footerText}>
              (c) {new Date().getFullYear()} {siteConfig.name}. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#f4f4f5",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    margin: "0",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    maxWidth: "560px",
    margin: "0 auto",
    padding: "0",
    overflow: "hidden" as const,
  },
  header: {
    padding: "32px 40px 24px",
  },
  logo: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0",
  },
  divider: {
    borderColor: "#e4e4e7",
    margin: "0",
  },
  content: {
    padding: "32px 40px",
  },
  signatureSection: {
    padding: "24px 40px",
  },
  signatureText: {
    fontSize: "15px",
    color: "#3f3f46",
    margin: "0",
  },
  footer: {
    padding: "24px 40px",
    backgroundColor: "#fafafa",
  },
  footerText: {
    fontSize: "13px",
    color: "#71717a",
    margin: "0 0 4px",
    lineHeight: "1.5",
  },
  footerLink: {
    color: "#71717a",
    textDecoration: "underline",
  },
} satisfies Record<string, React.CSSProperties>;
