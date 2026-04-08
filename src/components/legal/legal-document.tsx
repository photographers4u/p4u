import type { ReactNode } from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { spaceGrotesk } from "@/lib/fonts";

type LegalHighlight = {
  label: string;
  value: string;
};

export function LegalDocument({
  eyebrow,
  title,
  summary,
  effectiveDate,
  highlights,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  effectiveDate: string;
  highlights: LegalHighlight[];
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fffdf9_42%,#f8fafc_100%)] text-slate-900">
      <section className="border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 lg:px-10">
          <p className="text-xs font-semibold tracking-[0.24em] text-amber-700 uppercase">
            {eyebrow}
          </p>
          <h1
            className={`mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl ${spaceGrotesk.className}`}
          >
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
            {summary}
          </p>

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              Effective date: {effectiveDate}
            </span>
            <Link
              href={`mailto:${siteConfig.contact.support}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 transition hover:border-slate-300 hover:text-slate-950"
            >
              Contact: {siteConfig.contact.support}
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm"
              >
                <p className="text-[11px] font-semibold tracking-[0.2em] text-slate-500 uppercase">
                  {highlight.label}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {highlight.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10 sm:px-8 lg:px-10">
        <div className="space-y-4">{children}</div>
      </section>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700 sm:text-[15px]">
        {children}
      </div>
    </section>
  );
}

export function LegalList({
  items,
}: {
  items: readonly ReactNode[];
}) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-slate-400">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
