import { ArrowRight, BadgeCheck } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { spaceGrotesk } from "@/lib/fonts";
import { getAuthSession } from "@/server/auth/session";

const featuredLanes = [
  {
    label: "Photographer onboarding",
    href: "/onboarding",
  },
  {
    label: "Admin review",
    href: "/admin/photographers",
  },
] as const;

export default async function HomePage() {
  const session = await getAuthSession({ headers: await headers() });

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fffdf9_42%,#ffffff_100%)] text-slate-900">
        <section className="relative isolate overflow-hidden">
          <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col justify-center px-6 pb-20 pt-10 sm:px-8 lg:px-10">
            <div className="mx-auto max-w-4xl py-12 text-center lg:py-20">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/70 bg-white/85 px-3 py-1 text-xs font-medium tracking-[0.18em] text-amber-800 uppercase shadow-sm backdrop-blur">
                <BadgeCheck className="size-3.5" />
                Reviewed photographer platform
              </div>

              <h1
                className={`mt-6 text-5xl font-semibold tracking-tight text-balance text-slate-950 sm:text-6xl lg:text-7xl ${spaceGrotesk.className}`}
              >
                Photographer onboarding and review, without the leftover template noise.
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
                {siteConfig.description} Photographers can build their profile,
                offerings, and contact details in the dashboard, while admins
                review submissions and manage the shared item library.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 rounded-full px-6">
                  <Link href={session?.user ? "/dashboard" : "/register"}>
                    {session?.user ? "Open dashboard" : "Create an account"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-slate-300 bg-white/75 px-6 backdrop-blur"
                >
                  <Link href="/items">Browse items</Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {featuredLanes.map((lane) => (
                  <Link
                    key={lane.label}
                    href={lane.href}
                    className="rounded-full border border-white/80 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:border-slate-300 hover:text-slate-950"
                  >
                    {lane.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 sm:px-8 lg:px-10">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium tracking-[0.18em] text-slate-500 uppercase">
                Why it works
              </p>
              <h2
                className={`mt-4 max-w-xl text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl ${spaceGrotesk.className}`}
              >
                Built around the actual photographer workflow.
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-4xl font-semibold text-slate-950">4</p>
                <p className="mt-3 text-sm text-slate-600">
                  onboarding steps photographers complete before submission
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-4xl font-semibold text-slate-950">5</p>
                <p className="mt-3 text-sm text-slate-600">
                  explicit workflow states from draft to approved
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-4xl font-semibold text-slate-950">1</p>
                <p className="mt-3 text-sm text-slate-600">
                  admin workspace for moderation and supporting content
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 pb-20 sm:px-8 lg:px-10">
          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-10 text-white sm:px-8 lg:px-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm tracking-[0.18em] text-slate-300 uppercase">
                  Start here
                </p>
                <h2
                  className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${spaceGrotesk.className}`}
                >
                  Create a profile, submit it for review, and keep the rest of
                  the workspace tidy.
                </h2>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  Create an account to start photographer onboarding, or sign in
                  as an admin to review submissions and manage shared content.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="h-12 rounded-full bg-white px-6 text-slate-950 hover:bg-slate-100"
                >
                  <Link href="/register">Create your account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="h-12 rounded-full border-white/20 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
                >
                  <Link href="/login">Already a member?</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
