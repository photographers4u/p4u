import Link from "next/link";
import {
  ADMIN_DASHBOARD_RANGES,
  type AdminDashboardRange,
  buildAdminDashboardHref,
  getAdminDashboardRangeLabel,
} from "@/lib/admin-dashboard-range";
import { cn } from "@/lib/utils";

export function RangeTabs({
  activeRange,
}: {
  activeRange: AdminDashboardRange;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/20 p-1">
      {ADMIN_DASHBOARD_RANGES.map((range) => {
        const isActive = range === activeRange;

        return (
          <Link
            key={range}
            href={buildAdminDashboardHref(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {getAdminDashboardRangeLabel(range)}
          </Link>
        );
      })}
    </div>
  );
}
