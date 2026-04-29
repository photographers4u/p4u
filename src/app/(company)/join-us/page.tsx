"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Camera, ShieldCheck, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useRef } from "react";
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

const stats = [
  { label: "Verified Pros", val: "1.2k+" },
  { label: "Commission", val: "0%" },
  { label: "Reg. Fee", val: "Free" },
  { label: "Cities", val: "Pune+" },
];

const benefits = [
  {
    icon: ShieldCheck,
    title: "Verified Profiles",
    desc: "Our 2-3 day manual verification ensures a community of high-quality professionals.",
  },
  {
    icon: Zap,
    title: "100% Free Forever",
    desc: "No registration fees, no lead charges, and zero commission on your bookings.",
  },
  {
    icon: Users,
    title: "Direct Support",
    desc: "Facing issues? Contact our dedicated help desk via email or phone instantly.",
  },
];

export default function Photographers4uJoinPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const scaleImage = useTransform(scrollYProgress, [0, 0.3], [1, 1.05]);

  return (
    <main
      ref={containerRef}
      className="font-sans text-zinc-800 antialiased selection:bg-black/10 selection:text-black"
    >
      <section className="relative px-6 pb-24 pt-32">
        <div className="relative z-10 mx-auto max-w-4xl space-y-8 text-center">
          <FadeIn delay={0.1}>
            <CompanyTitle className="text-5xl md:text-7xl">
              Your work deserves <br />
              <span className="font-light text-zinc-500">
                to be discovered.
              </span>
            </CompanyTitle>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="mx-auto max-w-2xl text-lg font-light leading-relaxed text-zinc-500 md:text-xl">
              Join Photographers4u, the zero-commission platform where you
              showcase your portfolio, reach local clients, and grow your
              business completely for free.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
              <Button
                asChild
                className="rounded-full px-8 py-3 h-fit text-base"
              >
                <Link href="/register">Register as Photographer</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 py-3 h-fit text-base"
              >
                <Link href="/photographers">Explore the Platform</Link>
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-6xl">
          <FadeIn>
            <motion.div
              style={{ scale: scaleImage }}
              className="relative aspect-[21/9] overflow-hidden rounded-3xl bg-zinc-100 shadow-2xl shadow-zinc-200"
            >
              <Image
                src="/background.png"
                alt="Professional photography workflow"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 1152px, 100vw"
              />
            </motion.div>
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
                The platform built for you.
              </CompanyTitle>
            </div>

            <div className="space-y-16 md:col-span-2">
              <FadeIn>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-zinc-900">
                    Direct Client Connection
                  </h3>
                  <p className="leading-relaxed text-zinc-500">
                    We don&apos;t act as a middleman. We provide your
                    information to the customer, letting you negotiate your own
                    rates and handle payments directly.
                  </p>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-zinc-900">
                    Smart Lead Filtering
                  </h3>
                  <p className="leading-relaxed text-zinc-500">
                    Get discovered through our location, budget, and category
                    filters. Receive leads that actually match your expertise
                    and pricing.
                  </p>
                </div>
              </FadeIn>

              <div className="space-y-8 pt-8">
                {benefits.map((item, index) => (
                  <FadeIn key={item.title} delay={0.2 + index * 0.1}>
                    <div className="flex items-start gap-6">
                      <div className="rounded-2xl bg-zinc-100 p-3 text-zinc-900">
                        <item.icon size={24} strokeWidth={1.5} />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-zinc-900">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-500">
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

      <section className="border-y border-zinc-100 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:text-left">
                <p className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
                  {stat.val}
                </p>
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-32 text-center">
        <FadeIn>
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-900">
              <Camera size={24} />
            </div>
            <CompanyTitle
              as="h2"
              className="mb-6 text-4xl sm:text-5xl lg:text-5xl"
            >
              Ready to showcase your work?
            </CompanyTitle>
            <p className="mx-auto mb-10 max-w-sm text-zinc-500">
              Join Photographers4u today. Our verification team is standing by
              to help you go live.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                asChild
                className="rounded-full px-8 py-3.5 h-fit text-base"
              >
                <Link href="/register">Register Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full px-8 py-3.5 h-fit text-base"
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
