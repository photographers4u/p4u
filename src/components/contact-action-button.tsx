"use client";

import Link from "next/link";
import { forwardRef, type ReactNode } from "react";
import { apiClient } from "@/lib/api-client";
import type { PhotographerContactEventMethod } from "@/zod/schema/photographer-event";

export const ContactActionButton = forwardRef<
  HTMLAnchorElement,
  {
    href: string;
    method: PhotographerContactEventMethod;
    photographerId: string;
    shouldTrack: boolean;
    className?: string;
    children: ReactNode;
  }
>(function ContactActionButton(
  { href, method, photographerId, shouldTrack, className, children },
  ref,
) {
  function handleClick() {
    if (!shouldTrack) {
      return;
    }

    void apiClient.photographer.event.contact.$post({
      json: { photographerId, method },
    });
  }

  return (
    <Link ref={ref} href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
});
