import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { getSocket, registerSocketHandlers } from "@/services/socket/socket";
import { useCallStore } from "@/stores/call.store";
import { CallEvents, type IncomingCall } from "@/types/call";
import { useAuthStore } from "@/stores/auth.store";
import { agoraVoiceService } from "@/services/agora/agoraVoiceService";
import { nativeCallService } from "@/services/calls/nativeCallService";
import { callsService } from "@/services/api/calls.service";
import {
  handleIncomingCall,
  isCallHandled,
  stopIncomingCallAlerting
} from "./incomingCallNotificationHandler";

// If the ringing side hasn't progressed within this window, we treat the call as missed
// locally — the server will also mark it missed on reporter disconnect, but this keeps
// the UI honest when the signalling drops out from under us.
const RINGING_TIMEOUT_MS = 45_000;

export function useCallSocketHandlers(): void {
  const status = useAuthStore((s) => s.status);
  const setActive = useCallStore((s) => s.setActive);
  const setStatus = useCallStore((s) => s.setStatus);
  const markConnected = useCallStore((s) => s.markConnected);
  const setEndReason = useCallStore((s) => s.setEndReason);
  const markAudioConnected = useCallStore((s) => s.markAudioConnected);
  const reset = useCallStore((s) => s.reset);

  const ringingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastIncomingCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    const socket = getSocket();
    if (!socket) return;

    const clearRingingTimer = () => {
      if (ringingTimerRef.current) {
        clearTimeout(ringingTimerRef.current);
        ringingTimerRef.current = null;
      }
    };

    const normalizeIncoming = (payload: IncomingCall): IncomingCall => ({
      ...payload,
      reporterPhone: payload.reporterPhone ?? payload.callerPhone ?? "",
      carId: payload.carId ?? payload.vehicleId,
      carLabel: payload.carLabel ?? payload.vehiclePlate,
      imageCount: payload.imageCount ?? payload.incidentImages?.length ?? 0,
      status: payload.status ?? "ringing"
    });

    const onIncoming = (payload: IncomingCall) => {
      if (!payload?.callId) return;
      const callState = useCallStore.getState();
      if (
        (callState.status === "connecting" || callState.status === "active") &&
        (callState.activeCallId === payload.callId || callState.incoming?.callId === payload.callId)
      ) {
        return;
      }
      if (lastIncomingCallIdRef.current === payload.callId || isCallHandled(payload.callId)) return;
      lastIncomingCallIdRef.current = payload.callId;
      clearRingingTimer();
      const incoming = normalizeIncoming(payload);
      void handleIncomingCall(incoming);
      console.info("[AutoQr] call:incoming received", { callId: incoming.callId, incidentId: incoming.incidentId });
      console.info("[AutoQr] callStore updated", { callId: incoming.callId, status: "ringing" });
      console.info("[AutoQr] incoming screen opened", { callId: incoming.callId });
      ringingTimerRef.current = setTimeout(() => {
        const state = useCallStore.getState();
        if (state.status === "ringing" && state.incoming?.callId === payload.callId) {
          void callsService.missed(payload.callId, "timeout").catch(() => undefined);
          void nativeCallService.endNativeCall(payload.callId).catch(() => undefined);
          state.setEndReason("timeout");
          state.setStatus("missed");
          state.reset();
        }
      }, RINGING_TIMEOUT_MS);
    };

    const onMissed = (payload: { callId: string; reason?: string }) => {
      clearRingingTimer();
      void stopIncomingCallAlerting();
      void nativeCallService.endIncomingCall(payload.callId);
      setEndReason(payload.reason ?? "missed");
      setStatus("missed");
      reset();
    };

    const onAccepted = (payload: { callId: string; ownerSocketId?: string; reporterSocketId?: string }) => {
      clearRingingTimer();
      void stopIncomingCallAlerting();
      const sock = getSocket();
      const selfId = sock?.id ?? "";
      const reporterPeer = payload.reporterSocketId ?? null;
      const remote =
        selfId && payload.ownerSocketId === selfId
          ? reporterPeer
          : payload.ownerSocketId ?? reporterPeer ?? null;
      setActive({ callId: payload.callId, remoteSocketId: remote });
      setStatus("active");
      markConnected();

      if (agoraVoiceService.isActive()) markAudioConnected(true);
    };

    const onStarted = () => {
      setStatus("active");
      useCallStore.getState().markConnected();
      const callId = useCallStore.getState().activeCallId;
      if (callId) nativeCallService.markCallActive(callId);
    };

    const onEnded = (payload?: { callId?: string; reason?: string }) => {
      clearRingingTimer();
      void stopIncomingCallAlerting();
      setEndReason(payload?.reason ?? "ended");
      const callId = payload?.callId ?? useCallStore.getState().activeCallId ?? useCallStore.getState().incoming?.callId;
      if (callId) nativeCallService.markCallEnded(callId);
      agoraVoiceService.cleanup().catch(() => undefined);
      reset();
      if (router.canGoBack()) {
        try {
          router.back();
        } catch {
          // ignore
        }
      } else {
        router.replace("/(tabs)/dashboard");
      }
    };

    const onCancelled = (payload?: { callId?: string }) => {
      clearRingingTimer();
      const state = useCallStore.getState();
      if (
        payload?.callId &&
        state.activeCallId === payload.callId &&
        (state.status === "connecting" || state.status === "active")
      ) {
        return;
      }
      void stopIncomingCallAlerting();
      const callId = payload?.callId ?? state.incoming?.callId;
      if (callId) void nativeCallService.endIncomingCall(callId);
      setEndReason("reporter_cancelled");
      reset();
    };

    const onRejected = () => {
      clearRingingTimer();
      void stopIncomingCallAlerting();
      const callId = useCallStore.getState().incoming?.callId ?? useCallStore.getState().activeCallId;
      if (callId) nativeCallService.markCallEnded(callId);
      setEndReason("rejected");
      setStatus("declined");
      reset();
    };

    const cleanup = registerSocketHandlers({
      [CallEvents.CALL_INCOMING]: onIncoming,
      [CallEvents.CALLBACK_INCOMING]: onIncoming,
      [CallEvents.CALL_MISSED]: onMissed,
      [CallEvents.CALLBACK_MISSED]: onMissed,
      [CallEvents.CALL_ACCEPTED]: onAccepted,
      [CallEvents.CALLBACK_ACCEPTED]: onAccepted,
      [CallEvents.CALL_STARTED]: onStarted,
      [CallEvents.CALL_ENDED]: onEnded,
      [CallEvents.CALLBACK_ENDED]: onEnded,
      [CallEvents.CALL_CANCELLED]: onCancelled,
      [CallEvents.CALL_REJECTED]: onRejected,
      [CallEvents.CALLBACK_DECLINED]: onRejected
    });

    return () => {
      clearRingingTimer();
      cleanup();
    };
  }, [status, setActive, setStatus, markConnected, setEndReason, markAudioConnected, reset]);
}
