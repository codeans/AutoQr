import { apiClient } from "./client";
import type { AppNotification } from "@/types/notification";

export type NotificationListResponse = {
  notifications: AppNotification[];
  nextCursor: string | null;
  unreadCount: number;
  total: number;
};

export const notificationsService = {
  list: (params?: { cursor?: string; limit?: number; unreadOnly?: boolean }) =>
    apiClient.get<NotificationListResponse>("/notifications", {
      query: {
        cursor: params?.cursor,
        limit: params?.limit,
        unreadOnly: params?.unreadOnly ? "true" : undefined
      }
    }),
  unreadCount: () => apiClient.get<{ count: number }>("/notifications/unread-count"),
  markRead: (id: string) =>
    apiClient.patch<{ notification: AppNotification }>(`/notifications/${id}/read`),
  markAllRead: () =>
    apiClient.patch<{ ok: boolean; modified: number }>("/notifications/read-all")
};
