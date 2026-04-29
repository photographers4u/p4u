import type { ReactNode } from "react";
import { playfairDisplay } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function CompanyTitle({
  children,
  className,
  as: Tag = "h1",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "text-4xl font-semibold leading-[1.05] tracking-tight text-slate-950 text-balance sm:text-5xl lg:text-6xl",
        playfairDisplay.className,
        className,
      )}
    >
      {children}
    </Tag>
  );
}
