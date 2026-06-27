"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export type LightboxImage = {
  id: string;
  imageUrl: string;
  alt?: string;
};

export function ImageLightbox({
  images,
  index,
  onClose,
  onIndexChange,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}) {
  const isOpen = index !== null;
  const touchStartXRef = useRef<number | null>(null);

  const goTo = useCallback(
    (nextIndex: number) => {
      const total = images.length;
      onIndexChange(((nextIndex % total) + total) % total);
    },
    [images.length, onIndexChange],
  );

  const goPrev = useCallback(() => {
    if (index !== null) {
      goTo(index - 1);
    }
  }, [goTo, index]);

  const goNext = useCallback(() => {
    if (index !== null) {
      goTo(index + 1);
    }
  }, [goTo, index]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        goPrev();
      } else if (event.key === "ArrowRight") {
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, goPrev, goNext]);

  if (index === null) {
    return null;
  }

  const current = images[index];

  if (!current) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="inset-0! top-0! left-0! flex! h-dvh! w-screen! max-w-none! translate-x-0! translate-y-0! items-center justify-center rounded-none! border-none! bg-black/95! p-0! ring-0!"
        onTouchStart={(event) => {
          touchStartXRef.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const startX = touchStartXRef.current;
          if (startX === null) {
            return;
          }

          const deltaX = (event.changedTouches[0]?.clientX ?? startX) - startX;

          if (Math.abs(deltaX) > 50) {
            if (deltaX > 0) {
              goPrev();
            } else {
              goNext();
            }
          }

          touchStartXRef.current = null;
        }}
      >
        <DialogTitle className="sr-only">{current.alt ?? "Photo"}</DialogTitle>
        <DialogDescription className="sr-only">
          Image {index + 1} of {images.length}
        </DialogDescription>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
        >
          <X className="size-5" />
        </button>

        {images.length > 1 ? (
          <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
            {index + 1} / {images.length}
          </div>
        ) : null}

        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 sm:left-4 sm:flex"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/10 p-2 text-white backdrop-blur transition hover:bg-white/20 sm:right-4 sm:flex"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        ) : null}

        <div className="flex h-full w-full items-center justify-center p-4 sm:p-10">
          {/* biome-ignore lint/performance/noImgElement: full-screen viewer for externally hosted uploads */}
          <img
            key={current.id}
            src={current.imageUrl}
            alt={current.alt ?? "Photo"}
            className="max-h-full max-w-full object-contain select-none"
            draggable={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
