import { AppState, Platform, type AppStateStatus } from "react-native";
import { router } from "expo-router";
import type { IncomingCall } from "@/types/call";
import { useCallStore } from "@/stores/call.store";
import { callsService } from "@/services/api/calls.service";
import { nativeCallService } from "@/services/calls/nativeCallService";
import { callAlertService, SHOULD_VIBRATE_FOR_INCOMING_CALL } from "@/services/calls/callAlertService";
import { pendingCallBridge, type HandledCallOutcome } from "@/services/calls/pendingCallBridge";

const RINGING_TIMEOUT_MS = 45_000;
const handledCallIds = new Map<string, number>();

let appState: AppStateStatus = AppState.currentState;
let appStateSub: { remove: () => void } | null = null;
let ringingTimeout: ReturnType<typeof setTimeout> | null = null;
let ringingCallId: string | null = null;

function pruneHandledIds(): void {
  const now = Date.now();
  for (const [callId, ts] of handledCallIds.entries()) {
    if (now - ts > 10 * 60_000) handledCallIds.delete(callId);
  }
}

function rememberCallId(callId: string): void {
  handledCallIds.set(callId, Date.now());
  pruneHandledIds();
}

export function isCallHandled(callId: string | null | undefined): boolean {
  if (!callId) return false;
  if (handledCallIds.has(callId)) return true;
  return pendingCallBridge.isHandledLocally(callId);
}

export function markCallHandled(callId: string | null | undefined, outcome: HandledCallOutcome = "ended"): void {
  if (!callId) return;
  rememberCallId(callId);
  void pendingCallBridge.markHandled(callId, outcome).catch(() => undefined);
}

export function ensureIncomingCallAppStateWatcher(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (nextState) => {
    appState = nextState;
    if (nextState !== "active") {
      void callAlertService.cleanupCallAlerts();
    }
  });
}

export async function stopIncomingCallAlerting(): Promise<void> {
  if (ringingTimeout) {
    clearTimeout(ringingTimeout);
    ringingTimeout = null;
  }
  await callAlertService.stopIncomingCallAlerts();
  ringingCallId = null;
}

function toIncomingCall(payload: Partial<IncomingCall> & { callId: string }): IncomingCall {
  return {
    callId: payload.callId,
    incidentId: payload.incidentId ?? "",
    vehicleId: payload.vehicleId ?? payload.carId,
    vehiclePlate: payload.vehiclePlate,
    callerPhone: payload.callerPhone,
    incidentImages: payload.incidentImages ?? [],
    ownerId: payload.ownerId,
    status: payload.status ?? "ringing",
    reporterSocketId: payload.reporterSocketId ?? "",
    reporterPhone: payload.reporterPhone ?? payload.callerPhone ?? "",
    reporterName: payload.reporterName,
    carId: payload.carId ?? payload.vehicleId,
    carLabel: payload.carLabel ?? payload.vehiclePlate ?? "",
    imageCount: payload.imageCount ?? payload.incidentImages?.length ?? 0,
    message: payload.message,
    platform: payload.platform,
    createdAt: payload.createdAt,
    expiresAt: payload.expiresAt,
    agoraChannelName: payload.agoraChannelName,
    agoraUidCaller: payload.agoraUidCaller,
    agoraUidReceiver: payload.agoraUidReceiver,
    agora: payload.agora
  };
}

function scheduleMissedTimeout(callId: string): void {
  if (ringingTimeout) clearTimeout(ringingTimeout);
  ringingTimeout = setTimeout(() => {
    const state = useCallStore.getState();
    if (state.status === "ringing" && state.incoming?.callId === callId) {
      void callsService.missed(callId, "timeout").catch(() => undefined);
      void nativeCallService.endNativeCall(callId).catch(() => undefined);
      state.setEndReason("timeout");
      state.setStatus("missed");
      void stopIncomingCallAlerting();
      state.reset();
    }
  }, RINGING_TIMEOUT_MS);
}

async function restoreIncomingCall(callId: string): Promise<IncomingCall | null> {
  try {
    const { call } = await callsService.get(callId);
    if (!call?.callId) return null;
    return toIncomingCall(call);
  } catch {
    return null;
  }
}

export async function handleIncomingCall(payload: Partial<IncomingCall> & { callId: string }): Promise<void> {
  ensureIncomingCallAppStateWatcher();
  const incoming = toIncomingCall(payload);
  if (await pendingCallBridge.isHandled(incoming.callId)) {
    console.info("[AutoQr] ignoring incoming call already handled", { callId: incoming.callId });
    return;
  }
  const alreadyHandled = isCallHandled(incoming.callId);
  const current = useCallStore.getState().incoming?.callId;
  if (alreadyHandled && current === incoming.callId) return;
  rememberCallId(incoming.callId);

  useCallStore.getState().setIncoming(incoming);
  scheduleMissedTimeout(incoming.callId);
  const nativeDisplayed = await nativeCallService.displayIncomingCall(incoming).catch(() => false);

  if (appState === "active") {
    if (ringingCallId !== incoming.callId) {
      ringingCallId = incoming.callId;
      if (!nativeDisplayed && Platform.OS !== "android") {
        if (SHOULD_VIBRATE_FOR_INCOMING_CALL) {
          await callAlertService.startIncomingCallAlerts();
        } else {
          await callAlertService.startRingtone();
        }
      }
    }
    router.push(`/calls/incoming/${incoming.callId}` as never);
  }
}

export async function handleIncomingCallTap(callId: string, payload?: Partial<IncomingCall>): Promise<void> {
  ensureIncomingCallAppStateWatcher();
  let incoming = payload?.callId ? toIncomingCall(payload as Partial<IncomingCall> & { callId: string }) : null;
  const fresh = await restoreIncomingCall(callId);
  if (fresh) incoming = fresh;
  if (incoming) {
    useCallStore.getState().setIncoming(incoming);
    rememberCallId(callId);
    scheduleMissedTimeout(callId);
  }
  router.push(`/calls/incoming/${callId}` as never);
}
