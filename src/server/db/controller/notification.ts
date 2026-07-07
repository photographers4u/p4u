import { notificationDal } from "@/server/db/dal/notification";
import { NotFoundError } from "@/server/db/helpers/errors";
import type { CreateNotificationInput } from "@/zod/schema/notification";

export const notificationController = {
  async getListByUserId(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      notificationDal.listByUserId(userId),
      notificationDal.countUnreadByUserId(userId),
    ]);

    return { notifications, unreadCount };
  },

  async create(input: CreateNotificationInput) {
    return notificationDal.create(input);
  },

  async markRead(id: string, userId: string) {
    const updated = await notificationDal.markRead(id, userId);

    if (!updated) {
      throw new NotFoundError("Notification not found");
    }

    return updated;
  },

  async markAllRead(userId: string) {
    await notificationDal.markAllRead(userId);
  },
};
