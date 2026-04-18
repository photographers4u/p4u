import type { Metadata } from "next";

export const siteConfig = {
  name: "Photographers4U",
  shortName: "P4U",
  handle: "@photographers4u",
  logo: "P",
  description:
    "A moderated platform for photographer onboarding, profile management, and admin review workflows.",
  contact: {
    email: "hello@photographers4u.app",
    support: "support@photographers4u.app",
    phone: "+91 92707 02739",
    address: {
      city: "Pune, Maharashtra",
      pin: "411038",
      country: "India",
    },
  },
  socials: {
    linkedin: "https://linkedin.com",
    twitter: "https://x.com",
    instagram: "https://instagram.com",
  },
  metadata: {
    title: {
      default: "Photographers4U",
      template: "%s | Photographers4U",
    },
    description:
      "A moderated platform for photographer onboarding, profile management, and admin review workflows.",
  } satisfies Metadata,
} as const;
