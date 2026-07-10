"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import { cn } from "@/lib/utils";

export function ProfileHeroAvatar({ src, alt }: { src: string; alt: string }) {
  const { isLoaded, onLoad, onError } = useImageLoaded();

  return (
    <div className="relative size-20 shrink-0 overflow-hidden rounded-full shadow-sm ring-1 ring-slate-200 sm:size-24 lg:size-32">
      {isLoaded ? null : <Skeleton className="absolute inset-0 rounded-full" />}
      {/* biome-ignore lint/performance/noImgElement: photographer avatars are stored on an external host */}
      <img
        src={src}
        alt={alt}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
