import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { PermissionPrimer } from "./PermissionPrimer";
import {
  getPermissionStatus,
  registerPushToken,
  requestNotificationPermission,
  type PermissionStatus
} from "@/services/notifications/notifications";

export function NotificationPermissionScreen() {
  const [status, setStatus] = useState<PermissionStatus | null>(null);

  useEffect(() => {
    getPermissionStatus().then(setStatus).catch(() => setStatus("undetermined"));
  }, []);

  const handlePrimary = useCallback(async () => {
    const ok = await requestNotificationPermission();
    if (ok) {
      registerPushToken().catch(() => undefined);
      if (router.canGoBack()) router.back();
      else router.replace("/");
      return;
    }
    // If the user has definitively denied, switch to "open settings" mode
    const next = await getPermissionStatus();
    setStatus(next);
  }, []);

  const handleSkip = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  if (status === null) return null;

  const isDenied = status === "denied";

  return (
    <PermissionPrimer
      icon="notifications"
      title={isDenied ? "Turn on notifications" : "Stay in the loop"}
      body={
        isDenied
          ? "Notifications are turned off. Open Settings to let AutoQr alert you for incoming calls and incidents."
          : "AutoQr needs permission to notify you when someone reports an incident on your vehicle or calls you through your tag."
      }
      reassurance="We only notify you about your own vehicles — never marketing."
      primaryLabel={isDenied ? "Open Settings" : "Enable notifications"}
      onPrimary={handlePrimary}
      showOpenSettings={isDenied}
      secondaryLabel="Not now"
      onSecondary={handleSkip}
    />
  );
}
