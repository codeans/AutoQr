import { useEffect } from "react";
import { getSocket, registerSocketHandlers } from "@/services/socket/socket";
import { useAuthStore } from "@/stores/auth.store";
import { useNotificationStore } from "@/stores/notification.store";
import { NotificationEvents, type AppNotification } from "@/types/notification";
import { showLocalNotification, setBadgeCount } from "@/services/notifications/notifications";

const channelForType = (type: string): "calls" | "incidents" | "default" => {
  if (type === "INCOMING_CALL" || type === "MISSED_CALL" || type === "CALL_ENDED") return "calls";
  if (type === "INCIDENT_CREATED") return "incidents";
  return "default";
};

export function useNotificationSocketHandlers(): void {
  const status = useAuthStore((s) => s.status);
  const prependIncoming = useNotificationStore((s) => s.prependIncoming);

  useEffect(() => {
    if (status !== "authenticated") return;
    const socket = getSocket();
    if (!socket) return;

    const handleNew = (payload: AppNotification) => {
      if (!payload?.id || !payload?.type) return;
      const normalized: AppNotification = {
        ...payload,
        isRead: payload.isRead ?? false,
        data: payload.data ?? {}
      };
      prependIncoming(normalized);
      const unread = useNotificationStore.getState().unreadCount;
      setBadgeCount(unread).catch(() => undefined);

      // Do NOT raise a local notification for incoming calls — the dedicated call event
      // already drives the call screen + calls channel push.
      if (normalized.type === "INCOMING_CALL") return;

      showLocalNotification({
        title: normalized.title,
        body: normalized.body,
        data: { notificationId: normalized.id, ...normalized.data },
        channelId: channelForType(normalized.type)
      }).catch(() => undefined);
    };

    const handleIncidentCreated = (payload: { incidentId?: string; title?: string; message?: string }) => {
      if (!payload?.incidentId) return;
      console.info("[AutoQr] incident:created received", { incidentId: payload.incidentId });
    };

    const cleanup = registerSocketHandlers({
      [NotificationEvents.NEW]: handleNew,
      [NotificationEvents.NEW_LEGACY]: handleNew,
      [NotificationEvents.INCIDENT_CREATED]: handleIncidentCreated,
      [NotificationEvents.INCIDENT_CREATED_LEGACY]: handleIncidentCreated
    });

    return cleanup;
  }, [status, prependIncoming]);
}
