import React, { useCallback, useEffect, useState } from "react";
import { router } from "expo-router";
import * as Notifications from "expo-notifications"; // only used for typing check
import { PermissionPrimer } from "./PermissionPrimer";

// We use expo-notifications for push; the actual mic permission is requested lazily when the
// WebRTC peer calls getUserMedia. On the first accepted call Expo will trigger the OS prompt,
// but this primer exposes it up front so the user understands why.

async function tryRequestMic(): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const webrtc = require("react-native-webrtc") as { mediaDevices?: { getUserMedia?: (opts: unknown) => Promise<unknown> } };
    if (!webrtc?.mediaDevices?.getUserMedia) return false;
    const stream = (await webrtc.mediaDevices.getUserMedia({ audio: true, video: false })) as { getTracks?: () => Array<{ stop: () => void }> };
    stream.getTracks?.().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function MicrophonePermissionScreen() {
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    // Probe Notifications typing so we keep the import usable for side-effect — no-op.
    void Notifications.getPermissionsAsync;
    setAvailable(true);
  }, []);

  const handlePrimary = useCallback(async () => {
    const ok = await tryRequestMic();
    if (ok) {
      if (router.canGoBack()) router.back();
      else router.replace("/");
    } else {
      setAvailable(false);
    }
  }, []);

  const handleSkip = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  }, []);

  return (
    <PermissionPrimer
      icon="mic"
      title={available === false ? "Microphone not available" : "Allow microphone"}
      body={
        available === false
          ? "We couldn't reach your microphone. Open Settings and allow AutoQr to use the microphone so callers can hear you."
          : "To take calls from people who scanned your AutoQr tag, we need permission to use the microphone during a call."
      }
      reassurance="Your microphone is only used during active calls — never recorded."
      primaryLabel={available === false ? "Open Settings" : "Allow microphone"}
      onPrimary={handlePrimary}
      showOpenSettings={available === false}
      secondaryLabel="Not now"
      onSecondary={handleSkip}
    />
  );
}
