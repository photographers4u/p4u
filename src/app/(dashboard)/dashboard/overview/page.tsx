import { Bookmark, Eye, Images, Phone } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { DonutChart } from "@/components/admin/dashboard/donut-chart";
import { GrowthChart } from "@/components/admin/dashboard/growth-chart";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import PageHeader from "@/components/page-header";
import {
  CONTACT_CALL_COLOR,
  CONTACT_EMAIL_COLOR,
  PROFILE_VIEWS_COLOR,
} from "@/lib/admin-dashboard-colors";
import {
  buildDashboardOverviewHref,
  DASHBOARD_OVERVIEW_RANGES,
  getDashboardOverviewRangeFilters,
  getDashboardOverviewRangeLabel,
} from "@/lib/dashboard-overview-range";
import type { SearchParamsRecord } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { getApprovedPhotographerPanelData } from "@/server/services/photographer-panel";
import { getPhotographerGrowthOverview } from "@/server/services/photographer-event";

const numberFormatter = new Intl.NumberFormat("en");

function formatRelativeTime(date: Date) {
  const diffMinutes = Math.round((Date.now() - date.getTime()) / 60_000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

type DashboardOverviewPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function DashboardOverviewPage({
  searchParams,
}: DashboardOverviewPageProps) {
  const requestHeaders = await headers();
  const { photographer } =
    await getApprovedPhotographerPanelData(requestHeaders);
  const params = await searchParams;
  const { range } = getDashboardOverviewRangeFilters(params);
  const overview = await getPhotographerGrowthOverview(photographer.id, range);

  const contactBreakdown = [
    {
      key: "call",
      label: "Calls",
      value: overview.counts.contactCalls,
      color: CONTACT_CALL_COLOR,
    },
    {
      key: "email",
      label: "Emails",
      value: overview.counts.contactEmails,
      color: CONTACT_EMAIL_COLOR,
    },
  ];
  const totalContactClicks =
    overview.counts.contactCalls + overview.counts.contactEmails;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          className="mb-0"
          title="Your growth"
          subtitle="See how your profile is performing and who's reaching out."
        />
        <div className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-muted/20 p-1">
          {DASHBOARD_OVERVIEW_RANGES.map((tabRange) => (
            <Link
              key={tabRange}
              href={buildDashboardOverviewHref(tabRange)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                tabRange === range
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {getDashboardOverviewRangeLabel(tabRange)}
            </Link>
          ))}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          icon={Eye}
          label="Profile views"
          value={numberFormatter.format(overview.counts.views)}
          subtext="In selected range"
        />
        <StatTile
          icon={Phone}
          label="Contact clicks"
          value={numberFormatter.format(totalContactClicks)}
          subtext={`${overview.counts.contactCalls} calls · ${overview.counts.contactEmails} emails`}
        />
        <StatTile
          icon={Bookmark}
          label="Saved by"
          value={numberFormatter.format(overview.savedByCount)}
          subtext="Users who wishlisted you"
        />
        <StatTile
          icon={Images}
          label="Portfolio images"
          value={numberFormatter.format(overview.portfolioImageCount)}
        />
      </section>

      <section className="rounded-2xl border border-border/70 p-5 sm:p-6">
        <h2 className="text-sm font-medium text-foreground">
          Profile views over time
        </h2>
        <div className="mt-4">
          <GrowthChart
            data={overview.viewSeries}
            dataKey="count"
            label="Views"
            color={PROFILE_VIEWS_COLOR}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <h2 className="text-sm font-medium text-foreground">
            Contact breakdown
          </h2>
          <div className="mt-4">
            <DonutChart data={contactBreakdown} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 p-5 sm:p-6">
          <h2 className="text-sm font-medium text-foreground">
            Recent activity
          </h2>
          <div className="mt-4 space-y-3">
            {overview.recentContactEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contact activity yet.
              </p>
            ) : (
              overview.recentContactEvents.map((event, index) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static, non-reorderable list for a single request
                <p key={index} className="text-sm text-foreground">
                  Someone{" "}
                  {event.eventType === "contact_call" ? "called" : "emailed"}{" "}
                  you{" "}
                  <span className="text-muted-foreground">
                    · {formatRelativeTime(event.createdAt)}
                  </span>
                </p>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
