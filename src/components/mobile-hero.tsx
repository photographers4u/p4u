import Link from "next/link";
import { Button } from "@/components/ui/button";
import { playfairDisplay } from "@/lib/fonts";

export function MobileHero({ images }: { images: [string, string, string] }) {
  const [left, center, right] = images;

  return (
    <section className="relative overflow-hidden bg-white px-6 pt-10 pb-10 sm:hidden">
      <div className="flex items-center justify-center -space-x-8">
        <div className="z-0 h-32 w-24 shrink-0 -rotate-[10deg] translate-y-3 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={left} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="z-10 h-44 w-32 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={center} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="z-0 h-32 w-24 shrink-0 rotate-[10deg] translate-y-3 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={right} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="relative mt-8 text-center">
        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Verified photographers across India
        </span>

        <h1
          className="mt-4 text-3xl font-semibold leading-tight text-balance text-slate-950"
          style={playfairDisplay.style}
        >
          Capture the Perfect Moment
        </h1>

        <p className="mx-auto mt-3 max-w-xs text-[15px] leading-6 text-slate-600">
          Find the right photographer for your wedding, portrait, or event.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button asChild className="rounded-md px-6">
            <Link href="/photographers">Explore</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-md px-6">
            <Link href="/register">Join Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
