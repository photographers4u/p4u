import { asc, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { ADMIN_PANEL_ROLES } from "@/lib/admin-role";
import db, { type DBExecutor, type DBTransaction } from "@/server/db";
import {
  type DashboardSeriesPoint,
  type DashboardTimeBucket,
  dateTruncExpression,
} from "@/server/db/helpers/date-bucket";
import { user } from "@/server/db/schema";

type DBClient = DBExecutor | DBTransaction;

export const userDal = {
  async setRole(userId: string, role: string, executor: DBClient = db) {
    await executor.update(user).set({ role }).where(eq(user.id, userId));
  },

  async getUserById(id: string) {
    return db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, id))
      .limit(1)
      .then((rows) => rows[0] ?? null);
  },

  async listStaffUsers() {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(inArray(user.role, [...ADMIN_PANEL_ROLES]))
      .orderBy(desc(user.createdAt));
  },

  async getDashboardUserStats({ since }: { since: Date }): Promise<{
    total: number;
    newInRange: number;
    roleCounts: { role: string; count: number }[];
  }> {
    const normalizedRole = sql<string>`coalesce(${user.role}, 'user')`;
    const sinceIso = since.toISOString();
    const rows = await db
      .select({
        role: normalizedRole,
        count: sql<number>`count(*)`.mapWith(Number),
        newCount:
          sql<number>`count(*) filter (where ${user.createdAt} >= ${sinceIso}::timestamptz)`.mapWith(
            Number,
          ),
      })
      .from(user)
      .groupBy(normalizedRole);

    return {
      total: rows.reduce((sum, row) => sum + row.count, 0),
      newInRange: rows.reduce((sum, row) => sum + row.newCount, 0),
      roleCounts: rows.map(({ role, count }) => ({ role, count })),
    };
  },

  async getSignupSeries({
    bucket,
    since,
  }: {
    bucket: DashboardTimeBucket;
    since: Date;
  }): Promise<DashboardSeriesPoint[]> {
    const bucketExpr = dateTruncExpression(bucket, user.createdAt);

    return db
      .select({
        bucket: bucketExpr,
        count: sql<number>`count(*)`.mapWith(Number),
      })
      .from(user)
      .where(gte(user.createdAt, since))
      .groupBy(bucketExpr)
      .orderBy(asc(bucketExpr));
  },
};
