import type { Metadata } from "next";

const SITE_URL = "https://www.photographers4u.com";

export const siteConfig = {
  name: "Photographers4U",
  shortName: "Photographers4U",
  handle: "@photographers4u",
  logo: "P",
  url: SITE_URL,
  description:
    "Hire verified wedding, portrait, and event photographers across India. Browse portfolios, compare starting prices, and book directly on Photographers4U.",
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
    youtube: "https://www.youtube.com/@photographers4u",
    instagram: "https://www.instagram.com/photographers4u.hq/",
    twitter: "https://x.com/photographers4u",
    linkedin: "https://www.linkedin.com/company/thephotographers4u/",
  },
  // Pages that set their own `openGraph`/`twitter` metadata don't inherit
  // the root `opengraph-image` route automatically, so they need to
  // reference it explicitly to keep a banner in link previews.
  ogImage: {
    url: `${SITE_URL}/opengraph-image`,
    width: 1200,
    height: 630,
    alt: "Photographers4U",
  },
  metadata: {
    metadataBase: new URL(SITE_URL),
    title: {
      default: "Photographers4U | Hire Verified Photographers in India",
      template: "%s | Photographers4U",
    },
    description:
      "Hire verified wedding, portrait, and event photographers across India. Browse portfolios, compare starting prices, and book directly on Photographers4U.",
    keywords: [
      "Photographers4U",
      "Photographers For You",
      "Photographers For U",
      "hire photographers in Pune",
      "hire photographers in Mumbai",
      "hire photographers in Delhi",
      "hire photographers in Bangalore",
      "wedding photographers in India",
      "wedding photographers near me",
      "portrait photographers India",
      "book a photographer online",
    ],
    applicationName: "Photographers4U",
    authors: [{ name: "Photographers4U", url: SITE_URL }],
    creator: "Photographers4U",
    publisher: "Photographers4U",
    manifest: "/manifest.json",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: SITE_URL,
      siteName: "Photographers4U",
      title: "Photographers4U | Hire Verified Photographers in India",
      description:
        "Hire verified wedding, portrait, and event photographers across India. Browse portfolios, compare starting prices, and book directly.",
    },
    twitter: {
      card: "summary_large_image",
      site: "@photographers4u",
      creator: "@photographers4u",
      title: "Photographers4U | Hire Verified Photographers in India",
      description:
        "Hire verified wedding, portrait, and event photographers across India.",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
  } satisfies Metadata,
} as const;
