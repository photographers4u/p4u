import { headers } from "next/headers";
import { Footer } from "@/components/footer";
import Navbar from "@/components/navbar";
import { PhotographerCard } from "@/components/photographer-card";
import { getAuthSession } from "@/server/auth/session";
import { getPublicPhotographers } from "@/server/services/photographer";

export default async function PhotographersPage() {
  const requestHeaders = await headers();
  const [photographers, session] = await Promise.all([
    getPublicPhotographers(),
    getAuthSession({ headers: requestHeaders }),
  ]);

  return (
    <>
      <Navbar session={session} />
      <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#fffaf4_42%,#ffffff_100%)]">
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-border pb-6">
            <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Live directory
            </span>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                Browse approved photographers.
              </h1>
              <p className="text-base leading-7 text-slate-600">
                Explore live photographer profiles, open their portfolios, and
                save the ones you want to come back to.
              </p>
            </div>
          </div>

          {photographers.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 px-6 py-14 text-center">
              <h2 className="text-2xl font-semibold text-slate-950">
                No photographers are live yet
              </h2>
              <p className="mt-2 text-slate-600">
                Approved photographer profiles will appear here as soon as they
                are published.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {photographers.map((photographer) => (
                <PhotographerCard
                  key={photographer.id}
                  photographer={photographer}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
