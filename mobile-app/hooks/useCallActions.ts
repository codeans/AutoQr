import { useCallback } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { getSocket } from "@/services/socket/socket";
import { useCallStore } from "@/stores/call.store";
import { CallEvents } from "@/types/call";
import { webrtcService } from "@/services/calls/webrtcService";
import { stopIncomingCallAlerting } from "@/features/calls/incomingCallNotificationHandler";
import { checkMicrophonePermission } from "@/services/permissions/permissionService";

export function useCallActions() {
  const incoming = useCallStore((s) => s.incoming);
  const setStatus = useCallStore((s) => s.setStatus);
  const markAudioConnected = useCallStore((s) => s.markAudioConnected);
  const setEndReason = useCallStore((s) => s.setEndReason);
  const reset = useCallStore((s) => s.reset);

  const accept = useCallback(async () => {
    const socket = getSocket();
    if (!socket || !incoming) return;

    const micStatus = await checkMicrophonePermission();
    if (micStatus !== "granted") {
      setStatus("failed");
      setEndReason("permission_denied");
      router.push("/permissions/microphone");
      return;
    }

    setStatus("connecting");
    await stopIncomingCallAlerting();

    // Eagerly open the mic so the accepted-state transition has an RTCPeerConnection to
    // hand off to — the socket handler `onAccepted` will re-run initializeCall if needed
    // but double-init is idempotent because initializeCall tears down first.
    const audioReady = await webrtcService
      .initializeCall(
        {
          callId: incoming.callId,
          remoteSocketId: incoming.reporterSocketId ?? null,
          role: "callee"
        },
        {
          onConnected: () => markAudioConnected(true),
          onDisconnected: () => markAudioConnected(false),
          onError: () => markAudioConnected(false)
        }
      )
      .catch(() => false);

    if (!audioReady) {
      setStatus("failed");
      setEndReason("permission_denied");
      router.push("/permissions/microphone");
      return;
    }

    socket.emit(CallEvents.CALL_ACCEPT, {
      callId: incoming.callId,
      platform: Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web"
    });
  }, [incoming, markAudioConnected, setEndReason, setStatus]);

  const reject = useCallback(
    (reason?: string) => {
      const socket = getSocket();
      if (socket && incoming) {
        socket.emit(CallEvents.CALL_REJECT, { callId: incoming.callId, reason });
      }
      setEndReason(reason ?? "rejected");
      void stopIncomingCallAlerting();
      webrtcService.cleanup().catch(() => undefined);
      reset();
    },
    [incoming, reset, setEndReason]
  );

  const end = useCallback(() => {
    const socket = getSocket();
    const state = useCallStore.getState();
    const activeCallId = state.activeCallId ?? incoming?.callId ?? null;
    const remoteSocketId = state.remoteSocketId ?? incoming?.reporterSocketId ?? null;
    if (socket && activeCallId) {
      socket.emit(CallEvents.CALL_END, {
        callId: activeCallId,
        targetSocketId: remoteSocketId,
        reason: "owner_ended"
      });
    }
    setEndReason("owner_ended");
    void stopIncomingCallAlerting();
    webrtcService.cleanup().catch(() => undefined);
    reset();
  }, [incoming, reset, setEndReason]);

  return { accept, reject, end };
}
