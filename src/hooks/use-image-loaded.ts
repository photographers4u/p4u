"use client";

import { useState } from "react";

export function useImageLoaded() {
  const [isLoaded, setIsLoaded] = useState(false);

  return {
    isLoaded,
    onError: () => setIsLoaded(true),
    onLoad: () => setIsLoaded(true),
  };
}
