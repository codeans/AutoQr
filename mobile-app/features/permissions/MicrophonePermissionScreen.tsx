import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import { Linking } from "react-native";
import { PermissionPrimer } from "./PermissionPrimer";
import {
  checkMicrophonePermission,
  requestMicrophonePermission
} from "@/services/permissions/permissionService";
import type { PermissionState } from "@/services/permissions/types";

export function MicrophonePermissionScreen() {
  const [status, setStatus] = useState<PermissionState>("unknown");

  useEffect(() => {
    checkMicrophonePermission()
      .then(setStatus)
      .catch(() => setStatus("unknown"));
  }, []);

  const handlePrimary = useCallback(async () => {
    const next = await requestMicrophonePermission();
    setStatus(next);
    if (next === "granted") {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    }
  }, []);

  const handleOpenSettings = useCallback(() => {
    Linking.openSettings().catch(() => undefined);
  }, []);

  const handleSkip = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  const blocked = status === "blocked";
  const granted = status === "granted";

  return (
    <PermissionPrimer
      icon="mic"
      title={blocked ? "Microphone permission blocked" : granted ? "Microphone already enabled" : "Allow microphone"}
      body={
        blocked
          ? "Microphone access is blocked for AutoQr. Open your device settings and allow microphone access to join calls."
          : granted
            ? "Microphone permission is enabled. You can continue and accept calls directly."
            : "To take calls from people who scanned your AutoQr tag, we need permission to use the microphone during a call."
      }
      reassurance="Your microphone is only used during active calls — never recorded."
      primaryLabel={blocked ? "Open Settings" : granted ? "Continue" : "Allow microphone"}
      onPrimary={blocked ? handleOpenSettings : granted ? handleSkip : handlePrimary}
      showOpenSettings={blocked}
      secondaryLabel="Not now"
      onSecondary={handleSkip}
    />
  );
}
