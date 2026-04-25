import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCallStore } from "@/stores/call.store";
import type { NotificationType } from "@/types/notification";
import { callsService } from "@/services/api/calls.service";
import type { IncomingCall } from "@/types/call";

type TapData = {
  type?: NotificationType | string;
  incidentId?: string;
  callId?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  incidentImages?: string[];
  ownerId?: string;
  status?: string;
  reporterSocketId?: string;
  reporterPhone?: string;
  reporterPhoneMasked?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: "web" | "android" | "ios";
  createdAt?: string;
  notificationId?: string;
};

function extractData(notification: Notifications.Notification | null | undefined): TapData {
  const raw = (notification?.request?.content?.data ?? {}) as TapData;
  return raw || {};
}

function incomingFromTapData(data: TapData): IncomingCall | null {
  if (!data.callId) return null;
  return {
    callId: data.callId,
    incidentId: data.incidentId ?? "",
    vehicleId: data.vehicleId,
    vehiclePlate: data.vehiclePlate,
    callerPhone: data.callerPhone,
    incidentImages: data.incidentImages,
    ownerId: data.ownerId,
    status: data.status ?? "ringing",
    reporterSocketId: data.reporterSocketId ?? "",
    reporterPhone: data.reporterPhone ?? data.callerPhone ?? data.reporterPhoneMasked ?? "",
    reporterName: data.reporterName,
    carId: data.carId ?? data.vehicleId,
    carLabel: data.carLabel ?? data.vehiclePlate,
    imageCount: typeof data.imageCount === "number" ? data.imageCount : data.incidentImages?.length,
    message: data.message,
    platform: data.platform,
    createdAt: data.createdAt
  };
}

async function navigateForTap(data: TapData): Promise<void> {
  const type = (data.type ?? "") as string;

  // Incoming call — jump straight to the incoming-call screen; call store is already set
  // by the socket handler when app is foregrounded. For background/killed app launches,
  // hydrate incoming state from push payload so the call UI has data immediately.
  if (type === "INCOMING_CALL") {
    let incoming = incomingFromTapData(data);
    if (data.callId) {
      try {
        const fresh = await callsService.get(data.callId);
        incoming = { ...(incoming ?? {}), ...fresh.call };
      } catch {
        // Push payload is enough to render immediately; socket accept still validates server-side.
      }
    }
    if (incoming) {
      useCallStore.getState().setIncoming(incoming);
    }
    if (data.callId) {
      router.push(`/calls/incoming/${data.callId}` as never);
    } else {
      router.push("/call/incoming");
    }
    return;
  }

  if (type === "MISSED_CALL" || type === "call_missed") {
    router.push("/call/history");
    return;
  }

  if (type === "CALL_ENDED" || type === "call_ended") {
    router.push("/call/history");
    return;
  }

  if ((type === "INCIDENT_CREATED" || type === "incident_created") && data.incidentId) {
    router.push(`/incidents/${data.incidentId}`);
    return;
  }

  if (type === "QR_ACTIVATED" || type === "QR_DISPATCHED") {
    if (data.carId) {
      router.push(`/vehicles/${data.carId}`);
    } else {
      router.push("/(tabs)/vehicles");
    }
    return;
  }

  // Default → open notifications list
  router.push("/notifications");
}

export function useNotificationTapNavigation(): void {
  const status = useAuthStore((s) => s.status);
  const handledInitialRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") return;

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = extractData(response.notification);
      void navigateForTap(data);
    });

    // Handle the case where the app was launched from a killed state via a notification tap.
    if (!handledInitialRef.current) {
      handledInitialRef.current = true;
      Notifications.getLastNotificationResponseAsync()
        .then((response) => {
          if (!response) return;
          const data = extractData(response.notification);
          void navigateForTap(data);
        })
        .catch(() => undefined);
    }

    return () => {
      sub.remove();
    };
  }, [status]);
}
