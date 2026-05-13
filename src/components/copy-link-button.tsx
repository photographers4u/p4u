"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CopyLinkButton({
  url,
  showLabel = false,
  className,
}: {
  url: string;
  showLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Copy failed");
    }
  }

  return (
    <Button
      variant="outline"
      size={showLabel ? "default" : "icon-sm"}
      className={cn("rounded-full", className)}
      onClick={handleCopy}
      aria-label={copied ? "Link copied" : "Copy link"}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {showLabel ? (copied ? "Copied" : "Copy link") : null}
    </Button>
  );
}
