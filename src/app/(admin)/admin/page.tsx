import {
  BadgeCheck,
  Bookmark,
  Images,
  ShieldAlert,
  UserRoundCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import {
  DonutChart,
  type DonutChartSlice,
} from "@/components/admin/dashboard/donut-chart";
import { GrowthChart } from "@/components/admin/dashboard/growth-chart";
import {
  type PipelineBarRow,
  PipelineBars,
} from "@/components/admin/dashboard/pipeline-bars";
import { RangeTabs } from "@/components/admin/dashboard/range-tabs";
import { StatTile } from "@/components/admin/dashboard/stat-tile";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CATEGORICAL_PALETTE,
  ONBOARDING_FUNNEL_COLORS,
  OTHER_BUCKET_COLOR,
  PHOTOGRAPHER_SIGNUPS_COLOR,
  PHOTOGRAPHER_STATUS_COLORS,
  ROLE_COLORS,
  SPECIALITY_BAR_COLOR,
  USER_SIGNUPS_COLOR,
} from "@/lib/admin-dashboard-colors";
import { getAdminDashboardRangeFilters } from "@/lib/admin-dashboard-range";
import { getAdminPhotographerStatusFilterLabel } from "@/lib/admin-photographer-list";
import {
  getPhotographerStatusViewModel,
  getProfileInitials,
} from "@/lib/photographer-presentation";
import type { SearchParamsRecord } from "@/lib/search-params";
import { getAdminDashboardOverview } from "@/server/services/admin-dashboard";
import { ONBOARDING_STEPS } from "@/zod/helpers";
import type { PhotographerWorkflowStatus } from "@/zod/schema/photographer";

const adminDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});
const numberFormatter = new Intl.NumberFormat("en");

const STATUS_PIPELINE_ORDER: PhotographerWorkflowStatus[] = [
  "draft",
  "submitted",
  "pending_verification",
  "on_hold",
  "rejected",
  "approved",
];

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  sales: "Sales",
  user: "User",
  photographer: "Photographer",
};

type AdminPageProps = {
  searchParams: Promise<SearchParamsRecord>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const { range } = getAdminDashboardRangeFilters(params);
  const overview = await getAdminDashboardOverview(range);

  const statusCountMap = new Map(
    overview.statusCounts.map((entry) => [entry.status, entry.count]),
  );
  const needsAttentionCount =
    (statusCountMap.get("submitted") ?? 0) +
    (statusCountMap.get("pending_verification") ?? 0) +
    (statusCountMap.get("on_hold") ?? 0);

  const statusDonutData: DonutChartSlice[] = STATUS_PIPELINE_ORDER.map(
    (status) => ({
      key: status,
      label: getAdminPhotographerStatusFilterLabel(status),
      value: statusCountMap.get(status) ?? 0,
      color: PHOTOGRAPHER_STATUS_COLORS[status],
    }),
  );

  const pipelineRows: PipelineBarRow[] = statusDonutData;

  const cityDonutData: DonutChartSlice[] = overview.cityCounts.map(
    (entry, index) => ({
      key: entry.city,
      label: entry.city,
      value: entry.count,
      color: CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length],
    }),
  );

  const roleDonutData: DonutChartSlice[] = overview.users.roleCounts.map(
    (entry) => ({
      key: entry.role,
      label: ROLE_LABELS[entry.role] ?? entry.role,
      value: entry.count,
      color: ROLE_COLORS[entry.role] ?? OTHER_BUCKET_COLOR,
    }),
  );

  const onboardingCountMap = new Map(
    overview.onboardingStepCounts.map((entry) => [entry.step, entry.count]),
  );
  const onboardingRows: PipelineBarRow[] = ONBOARDING_STEPS.map((step) => ({
    key: String(step),
    label: `Step ${step} of ${ONBOARDING_STEPS.length}`,
    value: onboardingCountMap.get(step) ?? 0,
    color: ONBOARDING_FUNNEL_COLORS[step - 1],
  }));

  const specialityRows: PipelineBarRow[] = overview.topSpecialities.map(
    (entry) => ({
      key: entry.id,
      label: entry.name,
      value: entry.count,
      color: SPECIALITY_BAR_COLOR,
    }),
  );

  const photographerSignupData = overview.photographerSignups.map((point) => ({
    date: point.bucket.toISOString(),
    count: point.count,
  }));
  const userSignupData = overview.userSignups.map((point) => ({
    date: point.bucket.toISOString(),
    count: point.count,
  }));

  const avgTurnaroundLabel =
    overview.avgReviewTurnaroundDays === null
      ? "No reviews yet"
      : `${overview.avgReviewTurnaroundDays.toFixed(1)} days to review`;

  return (
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <h1 className="text-xl font-semibold text-slate-950">Dashboard</h1>
        <RangeTabs activeRange={range} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Images}
          label="Total Photographers"
          value={numberFormatter.format(overview.totals.total)}
          subtext={`${numberFormatter.format(overview.totals.published)} live · ${numberFormatter.format(needsAttentionCount)} in review`}
        />
        <StatTile
          icon={ShieldAlert}
          label="Needs Attention"
          value={numberFormatter.format(needsAttentionCount)}
          subtext="Submitted, pending verification & on hold"
          tone="highlight"
        />
        <StatTile
          icon={Users}
          label="Total Users"
          value={numberFormatter.format(overview.users.total)}
          subtext={`+${numberFormatter.format(overview.users.newInRange)} in range`}
        />
        <StatTile
          icon={BadgeCheck}
          label="Verified & Featured"
          value={numberFormatter.format(overview.totals.published)}
          subtext={`${numberFormatter.format(overview.totals.featured)} featured`}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatTile
          icon={Images}
          label="Portfolio Uploads"
          value={numberFormatter.format(overview.portfolioUploadCount)}
        />
        <StatTile
          icon={Bookmark}
          label="Saved by Users"
          value={numberFormatter.format(overview.bookmarkCount)}
        />
        <StatTile
          icon={UserRoundCheck}
          label="Team"
          value={numberFormatter.format(overview.staffTotal)}
          subtext="Admin & sales logins"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Photographer Signups</CardTitle>
            <CardDescription>New profiles created over time</CardDescription>
          </CardHeader>
          <CardContent>
            <GrowthChart
              data={photographerSignupData}
              dataKey="count"
              label="Photographers"
              color={PHOTOGRAPHER_SIGNUPS_COLOR}
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>User Signups</CardTitle>
            <CardDescription>New accounts created over time</CardDescription>
          </CardHeader>
          <CardContent>
            <GrowthChart
              data={userSignupData}
              dataKey="count"
              label="Users"
              color={USER_SIGNUPS_COLOR}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Photographers by Status</CardTitle>
            <CardDescription>Where every profile sits</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusDonutData} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Top Cities</CardTitle>
            <CardDescription>Where photographers are based</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={cityDonutData} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Regular users vs. staff logins</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={roleDonutData} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Verification Pipeline</CardTitle>
            <CardDescription>{avgTurnaroundLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBars rows={pipelineRows} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Onboarding Funnel</CardTitle>
            <CardDescription>Self-serve drafts by step reached</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBars rows={onboardingRows} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Top Specialities</CardTitle>
            <CardDescription>Most offered by photographers</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineBars rows={specialityRows} />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Staff</CardTitle>
            <CardDescription>Latest admin & sales logins</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentStaff.length === 0 ? (
              <p className="text-sm text-slate-500">No staff accounts yet</p>
            ) : (
              overview.recentStaff.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-950">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {member.email}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant="outline">
                      {ROLE_LABELS[member.role ?? "user"] ?? member.role}
                    </Badge>
                    <p className="mt-1 text-xs text-slate-500">
                      {adminDateFormatter.format(member.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
            <Link
              href="/admin/team"
              className="inline-block text-sm font-medium text-primary hover:underline"
            >
              View all staff
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Recently Created</CardTitle>
            <CardDescription>Newest photographer profiles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentlyCreated.length === 0 ? (
              <p className="text-sm text-slate-500">
                No photographer profiles yet
              </p>
            ) : (
              overview.recentlyCreated.map((entry) => {
                const status = getPhotographerStatusViewModel(entry);

                return (
                  <Link
                    key={entry.id}
                    href={`/admin/photographer/${entry.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm transition-colors hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                        {getProfileInitials(entry.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">
                          {entry.name ?? "Untitled photographer profile"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Created {adminDateFormatter.format(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status.badgeVariant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="rounded-lg border-slate-200 text-slate-950 shadow-sm">
          <CardHeader>
            <CardTitle>Recently Reviewed</CardTitle>
            <CardDescription>
              Latest approve / reject / hold actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.recentlyReviewed.length === 0 ? (
              <p className="text-sm text-slate-500">
                Nothing has been reviewed yet
              </p>
            ) : (
              overview.recentlyReviewed.map((entry) => {
                const status = getPhotographerStatusViewModel(entry);

                return (
                  <Link
                    key={entry.id}
                    href={`/admin/photographer/${entry.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 text-sm transition-colors hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-700">
                        {getProfileInitials(entry.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950">
                          {entry.name ?? "Untitled photographer profile"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Reviewed{" "}
                          {entry.reviewedAt
                            ? adminDateFormatter.format(entry.reviewedAt)
                            : "recently"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={status.badgeVariant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
