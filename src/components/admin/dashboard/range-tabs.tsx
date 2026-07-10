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
    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
      {ADMIN_DASHBOARD_RANGES.map((range) => {
        const isActive = range === activeRange;

        return (
          <Link
            key={range}
            href={buildAdminDashboardHref(range)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-white text-slate-950 shadow-sm"
                : "text-slate-500 hover:text-slate-950",
            )}
          >
            {getAdminDashboardRangeLabel(range)}
          </Link>
        );
      })}
    </div>
  );
}
