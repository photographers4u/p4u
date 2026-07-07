"use client";

import type { InferResponseType } from "hono/client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiClient } from "@/lib/api-client";
import { readApiResponse } from "@/lib/api-response";
import { authClient } from "@/lib/auth-client";

type NotificationListResponse = InferResponseType<
  typeof apiClient.notification.$get,
  200
>;
type NotificationItem = NotificationListResponse["notifications"][number];

type NotificationsContextValue = {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoaded: boolean;
  markRead: (id: string) => void;
  markAllRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);
const POLL_INTERVAL_MS = 45_000;

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const userId = session?.user?.id ?? null;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      const response = await apiClient.notification.$get();
      const { payload } =
        await readApiResponse<NotificationListResponse>(response);

      if (response.ok && payload) {
        setNotifications(payload.notifications);
        setUnreadCount(payload.unreadCount);
      }
    } catch {
      // Notifications are non-critical; keep whatever was last loaded.
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isSessionPending) {
      return;
    }

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setIsLoaded(true);
      return;
    }

    void loadNotifications();
    const interval = setInterval(
      () => void loadNotifications(),
      POLL_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [userId, isSessionPending, loadNotifications]);

  const markRead = useCallback((id: string) => {
    setNotifications((current) => {
      const target = current.find((item) => item.id === id);

      if (!target || target.readAt) {
        return current;
      }

      setUnreadCount((count) => Math.max(0, count - 1));

      return current.map((item) =>
        item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
      );
    });

    void apiClient.notification[":id"].read.$post({ param: { id } });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) =>
      current.map((item) =>
        item.readAt ? item : { ...item, readAt: new Date().toISOString() },
      ),
    );
    setUnreadCount(0);

    void apiClient.notification["read-all"].$post();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, isLoaded, markRead, markAllRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider.",
    );
  }

  return context;
}
