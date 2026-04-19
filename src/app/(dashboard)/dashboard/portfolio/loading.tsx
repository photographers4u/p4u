import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioLoading() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-sky-200 bg-sky-50/80 px-5 py-4">
        <p className="text-sm font-semibold text-sky-950">
          Loading your photographer portfolio...
        </p>
        <p className="mt-1 text-sm text-sky-900/80">
          We&apos;re pulling in your latest profile details and review status.
        </p>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 max-w-xl" />
      </div>

      <div className="max-w-3xl space-y-8">
        <section className="space-y-6 rounded-3xl border border-border/70 bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          <div className="grid gap-5 sm:grid-cols-[9rem_1fr]">
            <Skeleton className="h-36 w-36 rounded-3xl" />

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />

              <div className="grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>

              <Skeleton className="h-10 w-36" />
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-3xl border border-border/70 bg-background p-6 shadow-sm">
          <div className="space-y-2">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>

          <Skeleton className="h-10 w-36" />
        </section>
      </div>
    </div>
  );
}
