"use client";

import { motion } from "framer-motion";
import { IndianRupee, Search, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CompanyTitle } from "@/components/company/company-typography";
import { Button } from "@/components/ui/button";

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

const highlights = [
  {
    icon: ShieldCheck,
    title: "Manual Verification",
    desc: "Every profile is vetted within 2-3 days for quality assurance.",
  },
  {
    icon: Search,
    title: "Lead Generation",
    desc: "A search-first approach that prioritizes your work and location.",
  },
  {
    icon: IndianRupee,
    title: "Zero Commission",
    desc: "Free for photographers and customers. No hidden charges.",
  },
];

export default function Photographers4uAboutPage() {
  return (
    <main className="text-zinc-800 antialiased selection:bg-black/10 selection:text-black">
      <section className="px-6 pb-24 pt-32">
        <div className="mx-auto max-w-4xl">
          <FadeIn>
            <CompanyTitle className="mb-8 max-w-4xl text-5xl md:text-6xl">
              Connecting visionaries with <br className="hidden md:block" /> the
              clients who value them most.
            </CompanyTitle>
            <p className="max-w-2xl text-lg font-light leading-relaxed text-zinc-500 md:text-xl">
              Photographers4u is a dedicated discovery platform designed to
              bridge the gap between talented photographers and potential
              clients. We are information providers, not middlemen.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <div className="relative aspect-21/9 overflow-hidden rounded-3xl bg-zinc-100 shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=1600&fit=crop"
                alt="Photographer framing a shot"
                fill
                unoptimized
                className="object-cover"
                sizes="(min-width: 1024px) 1152px, 100vw"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-zinc-100 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="md:col-span-1">
              <CompanyTitle
                as="h2"
                className="sticky top-24 text-3xl sm:text-4xl lg:text-4xl"
              >
                Our Ecosystem
              </CompanyTitle>
            </div>

            <div className="space-y-12 md:col-span-2">
              <FadeIn>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-zinc-900">
                    Curated Discovery
                  </h3>
                  <p className="leading-relaxed text-zinc-500">
                    We don&apos;t believe in cluttered directories. Our platform
                    uses location, budget, and category filters to ensure
                    customers find the exact match for their specific project
                    needs.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-zinc-900">
                    Absolute Independence
                  </h3>
                  <p className="leading-relaxed text-zinc-500">
                    Photographers retain full control. From negotiating your own
                    rates to handling your own payments, we empower you to run
                    your business your way with zero commission or registration
                    fees.
                  </p>
                </div>
              </FadeIn>

              <div className="space-y-6 pt-8">
                {highlights.map((item, index) => (
                  <FadeIn key={item.title} delay={0.2 + index * 0.1}>
                    <div className="flex items-start gap-5">
                      <item.icon
                        size={22}
                        className="mt-1 shrink-0 text-zinc-400"
                      />
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm text-zinc-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-100 px-6 py-32 text-center">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <CompanyTitle
              as="h2"
              className="mb-6 text-4xl sm:text-5xl lg:text-5xl"
            >
              Grow your photography business.
            </CompanyTitle>
            <p className="mb-10 text-zinc-500">
              Join a community of professionals who are getting discovered every
              day. No fees, just leads.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className="rounded-full px-8 py-3 h-fit text-base"
              >
                <Link href="/register">Register Free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 h-fit py-3 text-base"
              >
                <Link href="/contact">Get Support</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
