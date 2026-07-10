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
        "rounded-lg border p-5",
        isHighlight
          ? "border-slate-950/10 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-950",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            isHighlight
              ? "bg-white/10 text-white"
              : "bg-slate-50 text-slate-700 ring-1 ring-black/5",
          )}
        >
          <Icon className="size-4.5" />
        </div>
        <p
          className={cn(
            "text-sm font-medium",
            isHighlight ? "text-white/80" : "text-slate-500",
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
            isHighlight ? "text-white/70" : "text-slate-500",
          )}
        >
          {subtext}
        </p>
      ) : null}
    </div>
  );
}
