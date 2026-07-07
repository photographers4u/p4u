import { and, desc, eq, isNull, sql } from "drizzle-orm";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import { notification } from "@/server/db/schema";
import type { CreateNotificationInput } from "@/zod/schema/notification";

type DBClient = DBExecutor | DBTransaction;

const NOTIFICATION_LIST_LIMIT = 30;

export const notificationDal = {
  async create(input: CreateNotificationInput, executor: DBClient = db) {
    const [row] = await executor
      .insert(notification)
      .values({
        body: input.body ?? null,
        link: input.link ?? null,
        title: input.title,
        type: input.type,
        userId: input.userId,
      })
      .returning();

    return row ?? null;
  },

  async listByUserId(userId: string) {
    return db
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.createdAt))
      .limit(NOTIFICATION_LIST_LIMIT);
  },

  async countUnreadByUserId(userId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(notification)
      .where(and(eq(notification.userId, userId), isNull(notification.readAt)));

    return row?.count ?? 0;
  },

  async markRead(id: string, userId: string) {
    const [row] = await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.id, id), eq(notification.userId, userId)))
      .returning();

    return row ?? null;
  },

  async markAllRead(userId: string) {
    await db
      .update(notification)
      .set({ readAt: new Date() })
      .where(and(eq(notification.userId, userId), isNull(notification.readAt)));
  },
};
