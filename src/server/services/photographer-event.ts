import "server-only";

import type { DashboardOverviewRange } from "@/lib/dashboard-overview-range";
import { bookmarkDal } from "@/server/db/dal/bookmark";
import {
  type PhotographerEventType,
  photographerEventDal,
} from "@/server/db/dal/photographer-event";
import { photographerUploadDal } from "@/server/db/dal/photographer-upload";
import type { DashboardTimeBucket } from "@/server/db/helpers/date-bucket";
import type { PhotographerContactEventMethod } from "@/zod/schema/photographer-event";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function resolveRangeWindow(range: DashboardOverviewRange): {
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

export async function recordProfileView({
  photographerId,
  viewerUserId,
}: {
  photographerId: string;
  viewerUserId: string | null;
}) {
  try {
    await photographerEventDal.recordEvent({
      photographerId,
      viewerUserId,
      eventType: "view",
    });
  } catch (error) {
    // Analytics are non-critical; never let a tracking failure break the
    // profile page.
    console.error("Failed to record photographer profile view", {
      error,
      photographerId,
    });
  }
}

export async function recordContactClick({
  photographerId,
  viewerUserId,
  method,
}: {
  photographerId: string;
  viewerUserId: string;
  method: PhotographerContactEventMethod;
}) {
  await photographerEventDal.recordEvent({
    photographerId,
    viewerUserId,
    eventType: photographerEventDal.contactMethodToEventType(method),
  });
}

export async function getContactedPhotographerIdsByUserId(userId: string) {
  return photographerEventDal.getContactedPhotographerIdsByUserId(userId);
}

export type PhotographerGrowthOverview = {
  range: DashboardOverviewRange;
  counts: { views: number; contactCalls: number; contactEmails: number };
  viewSeries: { date: string; count: number }[];
  savedByCount: number;
  portfolioImageCount: number;
  recentContactEvents: { eventType: PhotographerEventType; createdAt: Date }[];
};

export async function getPhotographerGrowthOverview(
  photographerId: string,
  range: DashboardOverviewRange,
): Promise<PhotographerGrowthOverview> {
  const { since, bucket } = resolveRangeWindow(range);

  const [counts, viewSeriesRaw, savedByCount, portfolioImageCount, recentContactEvents] =
    await Promise.all([
      photographerEventDal.getEventCounts(photographerId, since),
      photographerEventDal.getEventSeries({
        photographerId,
        eventType: "view",
        bucket,
        since,
      }),
      bookmarkDal.countByValue("photographer", photographerId),
      photographerUploadDal.getCountByPhotographerId(photographerId),
      photographerEventDal.getRecentContactEvents(photographerId, 8),
    ]);

  return {
    range,
    counts,
    viewSeries: viewSeriesRaw.map((point) => ({
      date: point.bucket.toISOString(),
      count: point.count,
    })),
    savedByCount,
    portfolioImageCount,
    recentContactEvents,
  };
}
