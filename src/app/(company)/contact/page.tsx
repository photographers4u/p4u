"use client";

import { motion } from "framer-motion";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
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
    transition={{ duration: 0.7, delay, ease: [0.23, 1, 0.32, 1] }}
  >
    {children}
  </motion.div>
);

export default function ContactPage() {
  return (
    <main className="text-zinc-800 antialiased selection:bg-black/10 selection:text-black">
      <section className="px-6 pb-16 pt-32">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <CompanyTitle className="mb-6 max-w-4xl text-5xl md:text-6xl">
              We&apos;re here to help you <br className="hidden md:block" />
              build your creative career.
            </CompanyTitle>
            <p className="max-w-xl text-lg font-light leading-relaxed text-zinc-500">
              Facing issues with registration? Have a question about how we
              work? Reach out to our team directly and we&apos;ll point you in
              the right direction.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-32">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <FadeIn delay={0.1}>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <Mail size={20} className="text-zinc-900" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Email Support
                </h2>
              </div>
              <a
                href={`mailto:${siteConfig.contact.support}`}
                className="text-zinc-500 transition-colors hover:text-black"
              >
                {siteConfig.contact.support}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <Phone size={20} className="text-zinc-900" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Call Us
                </h2>
              </div>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="text-zinc-500 transition-colors hover:text-black"
              >
                {siteConfig.contact.phone}
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <Clock size={20} className="text-zinc-900" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Response Time
                </h2>
              </div>
              <p className="text-zinc-500">
                We typically respond within 24 hours.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="rounded-3xl border border-zinc-100 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-xl bg-zinc-50 p-3">
                  <MapPin size={20} className="text-zinc-900" />
                </div>
                <h2 className="text-2xl font-semibold text-zinc-900">
                  Location
                </h2>
              </div>
              <p className="text-zinc-500">
                {siteConfig.contact.address.city},{" "}
                {siteConfig.contact.address.country}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}
