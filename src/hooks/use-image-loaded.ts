"use client";

import { useCallback, useState } from "react";

export function useImageLoaded() {
  const [isLoaded, setIsLoaded] = useState(false);
  const markLoaded = useCallback(() => setIsLoaded(true), []);

  // Cached images can finish loading before React attaches `onLoad` during
  // mount/hydration, so the event never fires. This ref catches that case
  // by checking `complete` the moment the element exists.
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) {
        markLoaded();
      }
    },
    [markLoaded],
  );

  return {
    isLoaded,
    ref,
    onError: markLoaded,
    onLoad: markLoaded,
  };
}
