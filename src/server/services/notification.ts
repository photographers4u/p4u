import "server-only";

import { notificationController } from "@/server/db/controller/notification";
import type { CreateNotificationInput } from "@/zod/schema/notification";

export async function getNotificationListByUserId(userId: string) {
  return notificationController.getListByUserId(userId);
}

export async function createNotification(input: CreateNotificationInput) {
  return notificationController.create(input);
}

export async function markNotificationReadByUserId(id: string, userId: string) {
  return notificationController.markRead(id, userId);
}

export async function markAllNotificationsReadByUserId(userId: string) {
  return notificationController.markAllRead(userId);
}
