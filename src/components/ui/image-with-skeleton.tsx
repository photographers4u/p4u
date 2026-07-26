"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useImageLoaded } from "@/hooks/use-image-loaded";
import { cn } from "@/lib/utils";

export function ImageWithSkeleton({
  src,
  alt,
  className,
  imgClassName,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "lazy" | "eager";
}) {
  const { isLoaded, ref, onLoad, onError } = useImageLoaded();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoaded ? null : <Skeleton className="absolute inset-0 rounded-none" />}
      {/* biome-ignore lint/performance/noImgElement: externally hosted photo rendered with a custom skeleton loader */}
      <img
        ref={ref}
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={onLoad}
        onError={onError}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}
