import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { getSocket, registerSocketHandlers } from "@/services/socket/socket";
import { useCallStore } from "@/stores/call.store";
import { CallEvents, type IncomingCall } from "@/types/call";
import { useAuthStore } from "@/stores/auth.store";
import { webrtcService } from "@/services/calls/webrtcService";

// If the ringing side hasn't progressed within this window, we treat the call as missed
// locally — the server will also mark it missed on reporter disconnect, but this keeps
// the UI honest when the signalling drops out from under us.
const RINGING_TIMEOUT_MS = 45_000;

export function useCallSocketHandlers(): void {
  const status = useAuthStore((s) => s.status);
  const setIncoming = useCallStore((s) => s.setIncoming);
  const setActive = useCallStore((s) => s.setActive);
  const setStatus = useCallStore((s) => s.setStatus);
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
      if (lastIncomingCallIdRef.current === payload.callId) return;
      lastIncomingCallIdRef.current = payload.callId;
      clearRingingTimer();
      const incoming = normalizeIncoming(payload);
      setIncoming(incoming);
      console.info("[AutoQr] call:incoming received", { callId: incoming.callId, incidentId: incoming.incidentId });
      console.info("[AutoQr] callStore updated", { callId: incoming.callId, status: "ringing" });
      router.push(`/calls/incoming/${incoming.callId}` as never);
      console.info("[AutoQr] incoming screen opened", { callId: incoming.callId });
      ringingTimerRef.current = setTimeout(() => {
        const state = useCallStore.getState();
        if (state.status === "ringing" && state.incoming?.callId === payload.callId) {
          state.setEndReason("timeout");
          state.setStatus("missed");
          state.reset();
        }
      }, RINGING_TIMEOUT_MS);
    };

    const onMissed = (payload: { callId: string; reason?: string }) => {
      clearRingingTimer();
      setEndReason(payload.reason ?? "missed");
      setStatus("missed");
      reset();
    };

    const onAccepted = (payload: { callId: string; ownerSocketId?: string; reporterSocketId?: string }) => {
      clearRingingTimer();
      const remote = payload.ownerSocketId ?? payload.reporterSocketId ?? null;
      setActive({ callId: payload.callId, remoteSocketId: remote });
      webrtcService
        .initializeCall(
          { callId: payload.callId, remoteSocketId: remote, role: "callee" },
          {
            onConnected: () => markAudioConnected(true),
            onDisconnected: () => markAudioConnected(false),
            onError: () => markAudioConnected(false)
          }
        )
        .catch(() => undefined);
    };

    const onStarted = () => {
      setStatus("active");
      useCallStore.getState().markConnected();
    };

    const onEnded = (payload?: { reason?: string }) => {
      clearRingingTimer();
      setEndReason(payload?.reason ?? "ended");
      webrtcService.cleanup().catch(() => undefined);
      reset();
      if (router.canGoBack?.()) {
        try {
          router.back();
        } catch {
          // ignore
        }
      }
    };

    const onCancelled = () => {
      clearRingingTimer();
      setEndReason("reporter_cancelled");
      reset();
    };

    const onRejected = () => {
      clearRingingTimer();
      setEndReason("rejected");
      setStatus("declined");
      reset();
    };

    const cleanup = registerSocketHandlers({
      [CallEvents.CALL_INCOMING]: onIncoming,
      [CallEvents.CALL_RINGING]: onIncoming,
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
  }, [status, setIncoming, setActive, setStatus, setEndReason, markAudioConnected, reset]);
}
