import z from "zod";

type ReviewStatusTuple = readonly [string, ...string[]];

export const idValueSchema = z.uuid();
export const isoTimestampSchema = z.string().datetime();
export const reviewStatusValues = [
  "pending",
  "approved",
  "rejected",
  "on_hold",
] as const;

export function createReviewStatusSchema<
  const TValues extends ReviewStatusTuple,
>(statusValues: TValues) {
  return z.enum(statusValues);
}

export const reviewStatusSchema = createReviewStatusSchema(reviewStatusValues);

/**
 * Standard UUID primary key.
 *
 * Used as the main identifier for a record.
 */
export function idSchema() {
  return {
    id: idValueSchema,
  };
}

/**
 * Standard timestamps used on most entities.
 *
 * createdAt -> when the record was created
 * updatedAt -> last time the record was modified
 */
export function timestamps() {
  return {
    createdAt: autoTimestamp(),
    updatedAt: autoTimestamp(),
  };
}

export function entitySchema<TShape extends z.ZodRawShape>(shape: TShape) {
  return z.object({
    ...idSchema(),
    ...timestamps(),
    ...shape,
  });
}

/* -------------------------------------------------- */
/* TIMESTAMP HELPERS */
/* -------------------------------------------------- */

/**
 * Auto-generated timestamp.
 *
 * Use when:
 * - the value must always exist
 * - the backend/database sets the value
 *
 * Examples:
 * - createdAt
 * - updatedAt
 * - invitedAt
 */
export function autoTimestamp() {
  return isoTimestampSchema;
}

/**
 * Required timestamp provided manually.
 *
 * Use when:
 * - the value must exist
 * - the application decides the value
 *
 * Examples:
 * - inviteExpiresAt
 * - scheduledPublishAt
 */
export function manualTimestamp() {
  return isoTimestampSchema;
}

/**
 * Optional timestamp for events that may happen later.
 *
 * Starts as NULL and gets filled when the event occurs.
 *
 * Examples:
 * - acceptedAt
 * - revokedAt
 * - publishedAt
 */
export function eventTimestamp() {
  return isoTimestampSchema.nullable();
}

/* -------------------------------------------------- */
/* REVIEW / MODERATION */
/* -------------------------------------------------- */

/**
 * Moderation / review fields.
 *
 * Mirrors `reviewColumns()` in packages/db by default.
 * Pass a custom `statusSchema` when an entity has its own workflow states.
 */
export function reviewSchema<
  const TValues extends ReviewStatusTuple,
>(options?: {
  defaultStatus?: TValues[number];
  statusSchema?: z.ZodType<TValues[number]>;
}) {
  if (options?.statusSchema && options.defaultStatus === undefined) {
    throw new Error(
      "Custom review status schemas must provide a defaultStatus.",
    );
  }

  const statusSchema = (options?.statusSchema ??
    reviewStatusSchema) as z.ZodType<TValues[number]>;
  const defaultStatus = (options?.defaultStatus ??
    "pending") as TValues[number];

  return {
    status: statusSchema.default(defaultStatus),
    rejectionReason: z.string().nullable(),
    reviewedBy: z.string().nullable(),
    reviewedAt: eventTimestamp(),
  };
}

export function reviewEntitySchema<
  TShape extends z.ZodRawShape,
  const TValues extends ReviewStatusTuple,
>(
  shape: TShape,
  options?: {
    defaultStatus?: TValues[number];
    statusSchema?: z.ZodType<TValues[number]>;
  },
) {
  return entitySchema({
    ...shape,
    ...reviewSchema(options),
  });
}

export function reviewDecisionSchema(options?: {
  rejectionRequiredMessage?: string;
  onHoldRequiredMessage?: string;
}) {
  return z.discriminatedUnion("status", [
    z.object({
      status: z.literal("approved"),
      rejectionReason: z.null().optional(),
    }),
    z.object({
      status: z.literal("rejected"),
      rejectionReason: z
        .string()
        .trim()
        .min(
          1,
          options?.rejectionRequiredMessage ??
            "A rejection reason is required when rejecting",
        ),
    }),
    z.object({
      status: z.literal("on_hold"),
      rejectionReason: z
        .string()
        .trim()
        .min(
          1,
          options?.onHoldRequiredMessage ??
            "A reason is required when putting this submission on hold",
        ),
    }),
  ]);
}

export type ReviewDecisionInput = z.infer<
  ReturnType<typeof reviewDecisionSchema>
>;
