export function MobileHero({ images }: { images: [string, string, string] }) {
  const [left, center, right] = images;

  return (
    <section className="relative overflow-hidden bg-white px-6 pt-6 pb-3 sm:hidden">
      <div className="flex items-center justify-center -space-x-8">
        <div className="z-0 h-24 w-20 shrink-0 -rotate-10 translate-y-2 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={left} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="z-10 h-32 w-24 shrink-0 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={center} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="z-0 h-24 w-20 shrink-0 rotate-10 translate-y-2 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5">
          {/* biome-ignore lint/performance/noImgElement: decorative hero photo */}
          <img src={right} alt="" className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="relative mt-5 text-center">
        <h1 className="text-xl font-semibold leading-tight text-slate-950">
          Find your photographer
        </h1>
        <p className="mx-auto mt-1 max-w-xs text-[13px] leading-5 text-slate-500">
          Verified portfolios for weddings, portraits & events near you.
        </p>
      </div>
    </section>
  );
}
