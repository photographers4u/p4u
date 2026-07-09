import { and, asc, eq, gte, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import {
  type DashboardSeriesPoint,
  type DashboardTimeBucket,
  dateTruncExpression,
} from "@/server/db/helpers/date-bucket";
import { photographerEvent } from "@/server/db/schema";
import type { PhotographerContactEventMethod } from "@/zod/schema/photographer-event";

type DBClient = DBExecutor | DBTransaction;
export type PhotographerEventType = "view" | "contact_call" | "contact_email";

function contactMethodToEventType(
  method: PhotographerContactEventMethod,
): PhotographerEventType {
  return method === "call" ? "contact_call" : "contact_email";
}

export const photographerEventDal = {
  contactMethodToEventType,

  async recordEvent(
    {
      photographerId,
      viewerUserId,
      eventType,
    }: {
      photographerId: string;
      viewerUserId: string | null;
      eventType: PhotographerEventType;
    },
    executor: DBClient = db,
  ) {
    await executor.insert(photographerEvent).values({
      photographerId,
      viewerUserId,
      eventType,
    });
  },

  async getEventCounts(
    photographerId: string,
    since: Date,
    executor: DBClient = db,
  ): Promise<{ views: number; contactCalls: number; contactEmails: number }> {
    const [result] = await executor
      .select({
        views:
          sql<number>`count(*) filter (where ${photographerEvent.eventType} = 'view')`.mapWith(
            Number,
          ),
        contactCalls:
          sql<number>`count(*) filter (where ${photographerEvent.eventType} = 'contact_call')`.mapWith(
            Number,
          ),
        contactEmails:
          sql<number>`count(*) filter (where ${photographerEvent.eventType} = 'contact_email')`.mapWith(
            Number,
          ),
      })
      .from(photographerEvent)
      .where(
        and(
          eq(photographerEvent.photographerId, photographerId),
          gte(photographerEvent.createdAt, since),
        ),
      );

    return (
      result ?? { views: 0, contactCalls: 0, contactEmails: 0 }
    );
  },

  async getEventSeries(
    {
      photographerId,
      eventType,
      bucket,
      since,
    }: {
      photographerId: string;
      eventType: PhotographerEventType;
      bucket: DashboardTimeBucket;
      since: Date;
    },
    executor: DBClient = db,
  ): Promise<DashboardSeriesPoint[]> {
    const bucketExpr = dateTruncExpression(bucket, photographerEvent.createdAt);

    return executor
      .select({
        bucket: bucketExpr,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(photographerEvent)
      .where(
        and(
          eq(photographerEvent.photographerId, photographerId),
          eq(photographerEvent.eventType, eventType),
          gte(photographerEvent.createdAt, since),
        ),
      )
      .groupBy(bucketExpr)
      .orderBy(asc(bucketExpr));
  },

  async getRecentContactEvents(
    photographerId: string,
    limit: number,
    executor: DBClient = db,
  ): Promise<{ eventType: PhotographerEventType; createdAt: Date }[]> {
    return executor
      .select({
        eventType: photographerEvent.eventType,
        createdAt: photographerEvent.createdAt,
      })
      .from(photographerEvent)
      .where(
        and(
          eq(photographerEvent.photographerId, photographerId),
          sql`${photographerEvent.eventType} in ('contact_call', 'contact_email')`,
        ),
      )
      .orderBy(sql`${photographerEvent.createdAt} desc`)
      .limit(limit);
  },

  async getContactedPhotographerIdsByUserId(
    userId: string,
    executor: DBClient = db,
  ): Promise<string[]> {
    const lastContactedAt = sql<Date>`max(${photographerEvent.createdAt})`;
    const rows = await executor
      .select({
        photographerId: photographerEvent.photographerId,
        lastContactedAt,
      })
      .from(photographerEvent)
      .where(
        and(
          eq(photographerEvent.viewerUserId, userId),
          sql`${photographerEvent.eventType} in ('contact_call', 'contact_email')`,
        ),
      )
      .groupBy(photographerEvent.photographerId)
      .orderBy(sql`${lastContactedAt} desc`);

    return rows.map((row) => row.photographerId);
  },
};
