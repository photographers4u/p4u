import { text, timestamp, uuid } from "drizzle-orm/pg-core";

export function primaryKeyColumns() {
  return {
    id: uuid("id").primaryKey().defaultRandom(),
  };
}

export function timestampColumns() {
  return {
    createdAt: requiredTimestamptz("created_at"),
    updatedAt: requiredTimestamptz("updated_at"),
  };
}

// TIMESTAMPS

/**
 * Required + auto-generated timestamp.
 *
 * Use this when:
 * - the value should ALWAYS exist
 * - the DB should decide the time
 *
 * Examples:
 * - createdAt
 * - updatedAt
 * - invitedAt
 */
export function requiredTimestamptz(name: string) {
  return timestamp(name, { withTimezone: true }).notNull().defaultNow();
}

/**
 * Required, but NOT auto-generated.
 *
 * Use this when:
 * - the value must exist
 * - you KNOW it ahead of time
 * - but it should NOT be "now"
 *
 * Examples:
 * - inviteExpiresAt (now + 7 days)
 * - scheduledPublishAt
 */
export function requiredManualTimestamptz(name: string) {
  return timestamp(name, { withTimezone: true }).notNull();
}

/**
 * Optional event timestamp.
 *
 * Use this when:
 * - this starts as NULL
 * - you DON'T know when it will happen
 * - but you DO want to record WHEN it happens
 *
 * Examples:
 * - acceptedAt
 * - revokedAt
 * - publishedAt
 */
export function eventTimestamptz(name: string) {
  return timestamp(name, { withTimezone: true });
}

/**
 * Moderation / review columns.
 *
 * Spread into any table that goes through a moderation flow.
 */
export function reviewColumns() {
  return {
    status: text("status", {
      enum: ["pending", "approved", "rejected", "on_hold"],
    }).default("pending"),
    rejectionReason: text("rejection_reason"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: eventTimestamptz("reviewed_at"),
  };
}
