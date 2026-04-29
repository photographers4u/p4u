"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { CheckCircle2, FileText, Mail } from "lucide-react";
import type { ReactNode } from "react";
import { CompanyTitle } from "@/components/company/company-typography";
import { siteConfig } from "@/config/site";

const FadeIn = ({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

function PolicySection({
  title,
  summary,
  children,
  id,
}: {
  title: string;
  summary: string;
  children: ReactNode;
  id: string;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-24 border-b border-zinc-100 py-12 last:border-0"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-4">
          <h2 className="mb-3 text-2xl font-semibold text-zinc-900">{title}</h2>
          <p className="text-sm italic leading-relaxed text-zinc-500">
            {summary}
          </p>
        </div>

        <div className="space-y-4 text-[15px] leading-relaxed text-zinc-600 md:col-span-8">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPolicyPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  return (
    <main className="font-sans text-zinc-800 antialiased selection:bg-black/10 selection:text-black">
      <motion.div
        className="fixed left-0 right-0 top-0 z-50 h-1 origin-left bg-black"
        style={{ scaleX }}
      />

      <header className="border-b border-zinc-100 px-6 pb-12 pt-32">
        <div className="mx-auto max-w-5xl">
          <FadeIn>
            <CompanyTitle className="mb-6 text-5xl md:text-6xl">
              Privacy Policy
            </CompanyTitle>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-400">
              <span>Last Updated: January 2026</span>
              <span className="hidden h-1 w-1 rounded-full bg-zinc-300 md:block" />
              <span>Version 2.4</span>
              <span className="hidden h-1 w-1 rounded-full bg-zinc-300 md:block" />
              <button
                type="button"
                className="flex items-center gap-1.5 text-black hover:underline"
              >
                <FileText size={14} /> Download PDF
              </button>
            </div>
          </FadeIn>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 pb-32">
        <div className="py-12 text-lg font-light leading-relaxed text-zinc-500">
          At Photographers4U, we value your trust. This policy describes how we
          handle your personal information across our platform. We keep it
          simple: we collect only what we need to help you create or hire, and
          we protect it with industry-leading security.
        </div>

        <FadeIn delay={0.1}>
          <PolicySection
            id="collection"
            title="1. Data we collect"
            summary="We collect information that identifies you or helps us provide our services."
          >
            <p>
              To operate effectively, we collect <strong>Identity Data</strong>{" "}
              (name, bio, profile photo), <strong>Contact Data</strong> (email,
              billing address), and <strong>Technical Data</strong> (IP address,
              device type) to ensure platform security.
            </p>
            <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3">
                <CheckCircle2 size={16} className="mt-0.5 text-green-600" />
                <span className="text-xs">Account Information</span>
              </div>
              <div className="flex items-start gap-3 rounded-xl bg-zinc-50 p-3">
                <CheckCircle2 size={16} className="mt-0.5 text-green-600" />
                <span className="text-xs">Payment Details (via Stripe)</span>
              </div>
            </div>
          </PolicySection>
        </FadeIn>

        <FadeIn delay={0.2}>
          <PolicySection
            id="usage"
            title="2. How we use it"
            summary="We use your data to facilitate bookings and improve your experience."
          >
            <p>
              Your data allows us to process payments, verify identities, and
              connect photographers with clients. We also use aggregated,
              non-identifying data to improve our search algorithms and platform
              performance.
            </p>
            <p>
              <strong>
                We do not sell your personal data to third-party advertisers.
                Period.
              </strong>
            </p>
          </PolicySection>
        </FadeIn>

        <FadeIn delay={0.3}>
          <PolicySection
            id="security"
            title="3. Security & Storage"
            summary="Your data is encrypted and stored in secure, world-class data centers."
          >
            <p>
              We use <strong>TLS 1.3 encryption</strong> for all data in transit
              and <strong>AES-256 encryption</strong> for data at rest. Our
              systems undergo regular security audits to prevent unauthorized
              access.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="rounded bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase text-zinc-600">
                SOC2 Compliant
              </div>
              <div className="rounded bg-zinc-100 px-3 py-1 text-[11px] font-bold uppercase text-zinc-600">
                GDPR Ready
              </div>
            </div>
          </PolicySection>
        </FadeIn>

        <FadeIn delay={0.4}>
          <PolicySection
            id="cookies"
            title="4. Cookies"
            summary="We use cookies to keep you logged in and remember your preferences."
          >
            <p>
              Essential cookies are necessary for the platform to function. You
              can control non-essential cookies via your browser settings,
              though this may impact certain personalized features of the site.
            </p>
          </PolicySection>
        </FadeIn>

        <FadeIn delay={0.5}>
          <PolicySection
            id="rights"
            title="5. Your Rights"
            summary="You are in control of your information at all times."
          >
            <p>
              You have the right to access, correct, or delete your personal
              data. You can export your data at any time from your account
              settings. If you wish to close your account, we will purge your
              personal records from our active databases within 30 days.
            </p>
          </PolicySection>
        </FadeIn>

        <FadeIn delay={0.6}>
          <div className="mt-20 flex flex-col items-center justify-between gap-8 rounded-3xl border border-zinc-100 bg-zinc-50 p-8 md:flex-row md:p-12">
            <div className="text-center md:text-left">
              <h2 className="mb-2 text-2xl font-semibold text-zinc-900">
                Have questions about your privacy?
              </h2>
              <p className="text-sm text-zinc-500">
                Our Data Protection Officer is here to help you.
              </p>
            </div>
            <a
              href={`mailto:${siteConfig.contact.support}`}
              className="flex items-center gap-3 rounded-full bg-zinc-900 px-8 py-3 font-semibold text-white transition-all hover:bg-black active:scale-95"
            >
              <Mail size={18} />
              Email the DPO
            </a>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
