import z from "zod";
import {
  entitySchema,
  eventTimestamp,
  idValueSchema,
  requiredTextSchema,
} from "@/zod/helpers";

export const notificationTypeValues = [
  "photographer_approved",
  "photographer_rejected",
  "photographer_on_hold",
  "bookmark_received",
] as const;
export const notificationTypeSchema = z.enum(notificationTypeValues);

const notificationBaseShape = {
  userId: idValueSchema,
  type: notificationTypeSchema,
  title: requiredTextSchema("Title"),
  body: z.string().trim().nullable(),
  link: z.string().trim().nullable(),
  readAt: eventTimestamp(),
};

export const notificationSchema = entitySchema(notificationBaseShape);

export const createNotificationSchema = z.object({
  userId: idValueSchema,
  type: notificationTypeSchema,
  title: requiredTextSchema("Title"),
  body: z.string().trim().nullable().optional(),
  link: z.string().trim().nullable().optional(),
});

export const notificationIdParamsSchema = z.object({
  id: idValueSchema,
});

export type Notification = z.infer<typeof notificationSchema>;
export type NotificationType = z.infer<typeof notificationTypeSchema>;
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type NotificationIdParams = z.infer<typeof notificationIdParamsSchema>;
