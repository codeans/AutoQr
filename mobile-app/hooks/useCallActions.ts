import { useCallback } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { waitForSocketConnection, getSocket } from "@/services/socket/socket";
import { useCallStore } from "@/stores/call.store";
import { CallEvents, type IncomingCall } from "@/types/call";
import { agoraVoiceService } from "@/services/agora/agoraVoiceService";
import { nativeCallService } from "@/services/calls/nativeCallService";
import { stopIncomingCallAlerting } from "@/features/calls/incomingCallNotificationHandler";
import { checkMicrophonePermission } from "@/services/permissions/permissionService";
import { callsService } from "@/services/api/calls.service";

const isLiveCallStatus = (status?: string) => !status || status === "ringing" || status === "accepted" || status === "connected";
let acceptingCallId: string | null = null;

async function refreshIncomingForAccept(incoming: IncomingCall): Promise<IncomingCall | null> {
  try {
    const { call } = await callsService.get(incoming.callId);
    if (!call?.callId || !isLiveCallStatus(call.status)) return null;
    return { ...incoming, ...call };
  } catch {
    return incoming;
  }
}

export function useCallActions() {
  const incoming = useCallStore((s) => s.incoming);
  const setStatus = useCallStore((s) => s.setStatus);
  const setActive = useCallStore((s) => s.setActive);
  const markConnected = useCallStore((s) => s.markConnected);
  const markAudioConnected = useCallStore((s) => s.markAudioConnected);
  const setEndReason = useCallStore((s) => s.setEndReason);
  const reset = useCallStore((s) => s.reset);

  const acceptIncoming = useCallback(async (targetIncoming: IncomingCall | null | undefined) => {
    if (!targetIncoming) return;
    if (acceptingCallId === targetIncoming.callId) return;
    acceptingCallId = targetIncoming.callId;
    try {
      setStatus("connecting");
      const liveIncoming = await refreshIncomingForAccept(targetIncoming);
      if (!liveIncoming) {
        setStatus("missed");
        setEndReason("timeout");
        await stopIncomingCallAlerting();
        reset();
        return;
      }
      useCallStore.getState().setIncoming(liveIncoming);
      setStatus("connecting");

      const micStatus = await checkMicrophonePermission();
      if (micStatus !== "granted") {
        setStatus("failed");
        setEndReason("permission_denied");
        router.push("/permissions/microphone");
        return;
      }

      await stopIncomingCallAlerting();
      const socket = await waitForSocketConnection();
      if (!socket) {
        setStatus("failed");
        setEndReason("network_error");
        return;
      }
      setActive({
        callId: liveIncoming.callId,
        remoteSocketId: liveIncoming.reporterSocketId ?? null
      });

      const platform = Platform.OS === "ios" ? "ios" : Platform.OS === "android" ? "android" : "web";
      const acceptResult = await callsService.accept(liveIncoming.callId, platform, socket.id).catch(() => null);
      if (!acceptResult?.ok) {
        setStatus("failed");
        setEndReason("accept_failed");
        return;
      }
      const agora = acceptResult.call?.agora;
      if (!agora) {
        setStatus("failed");
        setEndReason("agora_token_missing");
        return;
      }
      const resolvedIncoming = acceptResult.call?.reporterSocketId
        ? {
            ...useCallStore.getState().incoming!,
            reporterSocketId: acceptResult.call.reporterSocketId
          }
        : useCallStore.getState().incoming ?? liveIncoming;
      useCallStore.getState().setIncoming(resolvedIncoming);
      setActive({
        callId: liveIncoming.callId,
        remoteSocketId: resolvedIncoming.reporterSocketId ?? null
      });
      const audioReady = await agoraVoiceService.join(liveIncoming.callId, agora, {
        onConnected: () => {
          markAudioConnected(true);
          setStatus("active");
          markConnected();
        },
        onReconnecting: () => markAudioConnected(false),
        onDisconnected: () => markAudioConnected(false),
        onError: () => markAudioConnected(false)
      });
      if (!audioReady) {
        await agoraVoiceService.cleanup().catch(() => undefined);
        markAudioConnected(false);
        setStatus("failed");
        setEndReason("audio_unavailable");
        return;
      }
      markConnected();
    } finally {
      acceptingCallId = null;
    }
  }, [markAudioConnected, markConnected, reset, setActive, setEndReason, setStatus]);

  const accept = useCallback(() => {
    void acceptIncoming(useCallStore.getState().incoming);
  }, [acceptIncoming]);

  const reject = useCallback(
    (reason?: string) => {
      const socket = getSocket();
      if (socket && incoming) {
        socket.emit(CallEvents.CALL_REJECT, { callId: incoming.callId, reason });
      }
      if (incoming?.callId) {
        nativeCallService.rejectNativeCall(incoming.callId);
        void callsService.decline(incoming.callId, reason ?? "rejected").catch(() => undefined);
      }
      setEndReason(reason ?? "rejected");
      void stopIncomingCallAlerting();
      agoraVoiceService.cleanup().catch(() => undefined);
      reset();
    },
    [incoming, reset, setEndReason]
  );

  const rejectIncoming = useCallback(
    (targetIncoming: IncomingCall | null | undefined, reason?: string) => {
      const socket = getSocket();
      if (socket && targetIncoming) {
        socket.emit(CallEvents.CALL_REJECT, { callId: targetIncoming.callId, reason });
      }
      if (targetIncoming?.callId) {
        nativeCallService.rejectNativeCall(targetIncoming.callId);
        void callsService.decline(targetIncoming.callId, reason ?? "rejected").catch(() => undefined);
      }
      setEndReason(reason ?? "rejected");
      void stopIncomingCallAlerting();
      agoraVoiceService.cleanup().catch(() => undefined);
      reset();
    },
    [reset, setEndReason]
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
    if (activeCallId) {
      nativeCallService.markCallEnded(activeCallId);
      void callsService.end(activeCallId, "owner_ended").catch(() => undefined);
    }
    setEndReason("owner_ended");
    void stopIncomingCallAlerting();
    agoraVoiceService.cleanup().catch(() => undefined);
    reset();
  }, [incoming, reset, setEndReason]);

  return { accept, acceptIncoming, reject, rejectIncoming, end };
}
