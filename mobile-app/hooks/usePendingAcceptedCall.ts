import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import { useCallStore } from "@/stores/call.store";
import { callsService } from "@/services/api/calls.service";
import { pendingCallBridge, type PendingAcceptedCall } from "@/services/calls/pendingCallBridge";
import { stopIncomingCallAlerting } from "@/features/calls/incomingCallNotificationHandler";
import { useCallActions } from "@/hooks/useCallActions";
import type { IncomingCall } from "@/types/call";

const TERMINAL_STATUSES = new Set(["ended", "missed", "declined", "rejected", "cancelled", "failed"]);

function buildIncomingFromPending(payload: PendingAcceptedCall): IncomingCall {
  return {
    callId: payload.callId,
    incidentId: payload.incidentId ?? "",
    callerPhone: payload.reporterPhone,
    reporterSocketId: "",
    reporterPhone: payload.reporterPhone ?? "",
    carLabel: payload.carLabel ?? "",
    incidentImages: [],
    imageCount: 0,
    status: "accepted",
    platform: Platform.OS === "android" ? "android" : Platform.OS === "ios" ? "ios" : "web",
    agora: payload.agora
  };
}

async function hydrateIncoming(payload: PendingAcceptedCall): Promise<IncomingCall | null> {
  try {
    const { call } = await callsService.get(payload.callId);
    if (!call?.callId) return null;
    if (call.status && TERMINAL_STATUSES.has(call.status)) return null;
    return {
      ...buildIncomingFromPending(payload),
      ...call,
      reporterPhone: call.reporterPhone ?? payload.reporterPhone ?? "",
      carLabel: call.carLabel ?? payload.carLabel ?? "",
      incidentImages: Array.isArray(call.incidentImages) ? call.incidentImages : [],
      agora: call.agora ?? payload.agora
    };
  } catch {
    return buildIncomingFromPending(payload);
  }
}

/**
 * Drains the native pending-accepted-call bridge into the JS world.
 *
 * The native layer persists "user accepted on lock screen" so JS can resume the
 * call regardless of how the app was started (cold start, background relaunch or
 * already-open). This hook hydrates the call from backend, jumps to the active
 * call screen and joins Agora — all without re-prompting the user to accept.
 */
export function usePendingAcceptedCall(): void {
  const status = useAuthStore((s) => s.status);
  const { acceptIncoming } = useCallActions();
  const inFlightRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (status !== "authenticated") return;
    if (!pendingCallBridge.isAvailable()) return;

    let mounted = true;

    const handlePending = async (payload: PendingAcceptedCall) => {
      if (!mounted) return;
      if (!payload?.callId) return;
      if (inFlightRef.current === payload.callId) return;
      inFlightRef.current = payload.callId;
      try {
        console.info("[AutoQr] pending native accept consumed", {
          callId: payload.callId,
          source: payload.source,
          acceptedAt: payload.acceptedAt
        });

        await stopIncomingCallAlerting();

        const state = useCallStore.getState();
        if (state.activeCallId === payload.callId && (state.status === "connecting" || state.status === "active")) {
          console.info("[AutoQr] pending accept already active in JS, skipping", { callId: payload.callId });
          return;
        }

        const incoming = await hydrateIncoming(payload);
        if (!incoming) {
          console.info("[AutoQr] pending accept call already finalized server-side, clearing", { callId: payload.callId });
          await pendingCallBridge.clearPending(payload.callId);
          await pendingCallBridge.markHandled(payload.callId, "ended");
          useCallStore.getState().reset();
          return;
        }

        useCallStore.getState().setIncoming(incoming);
        await pendingCallBridge.markHandled(payload.callId, "accepted");

        try {
          router.replace("/call/active");
        } catch (err) {
          console.warn("[AutoQr] failed to navigate to /call/active", err);
        }

        await acceptIncoming(incoming);
        console.info("[AutoQr] pending native accept flow completed", { callId: payload.callId });
      } catch (err) {
        console.warn("[AutoQr] pending native accept flow failed", err);
      } finally {
        if (inFlightRef.current === payload.callId) inFlightRef.current = null;
      }
    };

    void pendingCallBridge
      .consumePending()
      .then((pending) => {
        if (pending) void handlePending(pending);
      })
      .catch(() => undefined);

    const unsubscribePending = pendingCallBridge.onPendingAcceptedCall((event) => {
      void handlePending(event);
    });

    const unsubscribeUiClosed = pendingCallBridge.onIncomingUiClosed((event) => {
      if (!event?.callId) return;
      console.info("[AutoQr] native incoming UI closed", event);
    });

    const unsubscribeActionResult = pendingCallBridge.onNativeActionResult((event) => {
      if (!event?.callId) return;
      console.info("[AutoQr] native call action result", event);
    });

    return () => {
      mounted = false;
      unsubscribePending();
      unsubscribeUiClosed();
      unsubscribeActionResult();
    };
  }, [acceptIncoming, status]);

  useEffect(() => {
    if (status !== "authenticated") return;

    let mounted = true;
    void (async () => {
      try {
        const state = useCallStore.getState();
        if (state.status === "connecting" || state.status === "active") return;
        const { call } = await callsService.recoverActive();
        if (!mounted || !call?.callId) return;
        if (TERMINAL_STATUSES.has(String(call.status ?? "").toLowerCase())) return;
        useCallStore.getState().setIncoming(call);
        try {
          router.replace("/call/active");
        } catch {
          // ignore navigation race
        }
        await acceptIncoming(call);
      } catch {
        // best-effort recovery only
      }
    })();

    return () => {
      mounted = false;
    };
  }, [acceptIncoming, status]);
}
