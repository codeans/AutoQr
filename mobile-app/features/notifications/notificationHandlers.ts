import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { handleIncomingCallTap } from "@/features/calls/incomingCallNotificationHandler";
import type { NotificationType } from "@/types/notification";
import { routeIncomingCallNotification } from "@/services/notifications/fcmService";

type NotificationData = {
  type?: NotificationType | string;
  callId?: string;
  incidentId?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  incidentImages?: string[];
  ownerId?: string;
  status?: string;
  reporterSocketId?: string;
  reporterPhone?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: "web" | "android" | "ios";
  createdAt?: string;
  expiresAt?: string;
};

function getData(notification: Notifications.Notification | null | undefined): NotificationData {
  return ((notification?.request?.content?.data ?? {}) as NotificationData) || {};
}

async function navigateByType(data: NotificationData): Promise<void> {
  const type = String(data.type ?? "");
  if (type === "INCOMING_CALL" && data.callId) {
    await handleIncomingCallTap(data.callId, {
      callId: data.callId,
      incidentId: data.incidentId,
      vehicleId: data.vehicleId,
      vehiclePlate: data.vehiclePlate,
      callerPhone: data.callerPhone,
      incidentImages: data.incidentImages,
      ownerId: data.ownerId,
      status: data.status,
      reporterSocketId: data.reporterSocketId,
      reporterPhone: data.reporterPhone ?? data.callerPhone,
      reporterName: data.reporterName,
      carId: data.carId ?? data.vehicleId,
      carLabel: data.carLabel ?? data.vehiclePlate,
      imageCount: data.imageCount,
      message: data.message,
      platform: data.platform,
      createdAt: data.createdAt,
      expiresAt: data.expiresAt
    });
    return;
  }

  if (type === "MISSED_CALL" || type === "call_missed" || type === "CALL_ENDED" || type === "call_ended") {
    router.push("/call/history");
    return;
  }

  if ((type === "INCIDENT_CREATED" || type === "incident_created") && data.incidentId) {
    router.push(`/incidents/${data.incidentId}`);
    return;
  }

  router.push("/notifications");
}

export function useNotificationHandlers(): void {
  const status = useAuthStore((s) => s.status);
  const handledInitialRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const receiveSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = getData(notification);
      if (String(data.type ?? "") === "INCOMING_CALL" && data.callId) {
        void routeIncomingCallNotification(data as unknown as Record<string, unknown>);
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = getData(response.notification);
      void navigateByType(data);
    });

    if (!handledInitialRef.current) {
      handledInitialRef.current = true;
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (!response) return;
          const data = getData(response.notification);
          void navigateByType(data);
        })
        .catch(() => undefined);
    }

    return () => {
      receiveSub.remove();
      responseSub.remove();
    };
  }, [status]);
}
