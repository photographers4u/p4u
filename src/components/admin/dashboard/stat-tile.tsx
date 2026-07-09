import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type StatTileProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext?: string;
  tone?: "default" | "highlight";
};

export function StatTile({
  icon: Icon,
  label,
  value,
  subtext,
  tone = "default",
}: StatTileProps) {
  const isHighlight = tone === "highlight";

  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        isHighlight
          ? "border-foreground/10 bg-foreground text-background"
          : "border-border/60 bg-muted/15 text-foreground",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            isHighlight
              ? "bg-background/15 text-background"
              : "bg-background text-foreground shadow-sm",
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <p
          className={cn(
            "text-sm font-medium",
            isHighlight ? "text-background/80" : "text-muted-foreground",
          )}
        >
          {label}
        </p>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight">{value}</p>

      {subtext ? (
        <p
          className={cn(
            "mt-1 text-xs",
            isHighlight ? "text-background/70" : "text-muted-foreground",
          )}
        >
          {subtext}
        </p>
      ) : null}
    </div>
  );
}
