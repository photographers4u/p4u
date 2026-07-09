import "server-only";

import type { AdminDashboardRange } from "@/lib/admin-dashboard-range";
import type { DashboardTimeBucket } from "@/server/db/helpers/date-bucket";
import { bookmarkDal } from "@/server/db/dal/bookmark";
import { photographerDal } from "@/server/db/dal/photographer";
import { photographerSpecialityDal } from "@/server/db/dal/photographer-speciality";
import { photographerUploadDal } from "@/server/db/dal/photographer-upload";
import { userDal } from "@/server/db/dal/user";
import { listAdminStaff } from "@/server/services/admin-staff";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const RECENT_LIST_LIMIT = 6;
const TOP_CITIES_LIMIT = 6;
const TOP_SPECIALITIES_LIMIT = 6;

function resolveRangeWindow(range: AdminDashboardRange): {
  since: Date;
  bucket: DashboardTimeBucket;
} {
  const now = Date.now();

  switch (range) {
    case "3m":
      return { since: new Date(now - 90 * MS_PER_DAY), bucket: "day" };
    case "6m":
      return { since: new Date(now - 182 * MS_PER_DAY), bucket: "week" };
    case "1y":
      return { since: new Date(now - 365 * MS_PER_DAY), bucket: "week" };
    default:
      return { since: new Date(now - 30 * MS_PER_DAY), bucket: "day" };
  }
}

// Run the dashboard's queries in small concurrent batches rather than all at
// once. A single Promise.all of 13 queries can momentarily need 13
// connections; batching keeps peak concurrency low (matches this app's dev
// DB pool size) so a burst of new connection setups doesn't push any one
// query past the database's statement_timeout.
async function runInBatches<T extends readonly (() => Promise<unknown>)[]>(
  tasks: T,
  batchSize: number,
): Promise<{ [K in keyof T]: Awaited<ReturnType<T[K]>> }> {
  const results: unknown[] = [];

  for (let index = 0; index < tasks.length; index += batchSize) {
    const batch = tasks.slice(index, index + batchSize);
    results.push(...(await Promise.all(batch.map((task) => task()))));
  }

  return results as { [K in keyof T]: Awaited<ReturnType<T[K]>> };
}

export async function getAdminDashboardOverview(range: AdminDashboardRange) {
  const { since, bucket } = resolveRangeWindow(range);

  const [
    totals,
    statusCounts,
    cityCounts,
    onboardingStepCounts,
    topSpecialities,
    photographerSignups,
    userSignups,
    recentlyReviewed,
    recentlyCreated,
    recentStaff,
    userStats,
    portfolioUploadCount,
    bookmarkCount,
  ] = await runInBatches(
    [
      () => photographerDal.getDashboardTotals({ since }),
      () => photographerDal.getStatusCounts(),
      () => photographerDal.getCityCounts(TOP_CITIES_LIMIT),
      () => photographerDal.getOnboardingStepCounts(),
      () => photographerSpecialityDal.getTopSpecialities(TOP_SPECIALITIES_LIMIT),
      () => photographerDal.getSignupSeries({ bucket, since }),
      () => userDal.getSignupSeries({ bucket, since }),
      () => photographerDal.getRecentlyReviewed(RECENT_LIST_LIMIT),
      () => photographerDal.getRecentlyCreated(RECENT_LIST_LIMIT),
      () => listAdminStaff(),
      () => userDal.getDashboardUserStats({ since }),
      () => photographerUploadDal.getTotalCount(),
      () => bookmarkDal.getTotalCount(),
    ] as const,
    4,
  );

  return {
    range,
    since,
    totals,
    statusCounts,
    cityCounts,
    onboardingStepCounts,
    topSpecialities,
    photographerSignups,
    userSignups,
    recentlyReviewed,
    recentlyCreated,
    recentStaff: recentStaff.slice(0, RECENT_LIST_LIMIT),
    staffTotal: recentStaff.length,
    avgReviewTurnaroundDays: totals.avgReviewTurnaroundDays,
    users: userStats,
    portfolioUploadCount,
    bookmarkCount,
  };
}

export type AdminDashboardOverview = Awaited<
  ReturnType<typeof getAdminDashboardOverview>
>;
