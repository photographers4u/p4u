import { type SQL, sql } from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";

export type DashboardTimeBucket = "day" | "week";

export type DashboardSeriesPoint = {
  bucket: Date;
  count: number;
};

export function dateTruncExpression(
  bucket: DashboardTimeBucket,
  column: PgColumn,
): SQL<Date> {
  const expression =
    bucket === "week"
      ? sql`date_trunc('week', ${column})`
      : sql`date_trunc('day', ${column})`;

  // postgres.js returns date_trunc's timestamp as a string, not a Date —
  // convert it here so every caller gets a real Date, same as the rest of
  // the app's mapWith(Number) convention for aggregate columns.
  return expression.mapWith((value: string) => new Date(value));
}
