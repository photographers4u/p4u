"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

export function ShareActions({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      console.error("Copy failed");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // ignore cancel
      }
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        <Share2 className="size-4" />
        Share
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
      >
        {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
