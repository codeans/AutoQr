import { AppState, type AppStateStatus, Vibration } from "react-native";
import { router } from "expo-router";
import { Audio } from "expo-av";
import type { IncomingCall } from "@/types/call";
import { useCallStore } from "@/stores/call.store";
import { callsService } from "@/services/api/calls.service";
import { nativeCallService } from "@/services/calls/nativeCallService";

const RINGING_TIMEOUT_MS = 45_000;
const VIBRATION_PATTERN = [0, 450, 220, 450, 220, 650];
const handledCallIds = new Map<string, number>();

let appState: AppStateStatus = AppState.currentState;
let appStateSub: { remove: () => void } | null = null;
let ringtone: Audio.Sound | null = null;
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
  return handledCallIds.has(callId);
}

export function ensureIncomingCallAppStateWatcher(): void {
  if (appStateSub) return;
  appStateSub = AppState.addEventListener("change", (nextState) => {
    appState = nextState;
  });
}

async function startForegroundRingtone(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: false
    });
    if (ringtone) {
      await ringtone.replayAsync();
      return;
    }
    const created = await Audio.Sound.createAsync(
      require("@/assets/sounds/autoqr_ringtone.wav"),
      { isLooping: true, volume: 1, shouldPlay: true }
    );
    ringtone = created.sound;
  } catch {
    // Gracefully continue when audio asset cannot be loaded.
  }
  Vibration.vibrate(VIBRATION_PATTERN, true);
}

export async function stopIncomingCallAlerting(): Promise<void> {
  if (ringingTimeout) {
    clearTimeout(ringingTimeout);
    ringingTimeout = null;
  }
  Vibration.cancel();
  try {
    if (ringtone) {
      await ringtone.stopAsync();
      await ringtone.unloadAsync();
      ringtone = null;
    }
  } catch {
    ringtone = null;
  }
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
    expiresAt: payload.expiresAt
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
  const alreadyHandled = isCallHandled(incoming.callId);
  const current = useCallStore.getState().incoming?.callId;
  if (alreadyHandled && current === incoming.callId) return;
  rememberCallId(incoming.callId);

  useCallStore.getState().setIncoming(incoming);
  scheduleMissedTimeout(incoming.callId);
  await nativeCallService.displayIncomingCall(incoming).catch(() => false);

  if (appState === "active") {
    if (ringingCallId !== incoming.callId) {
      ringingCallId = incoming.callId;
      await startForegroundRingtone();
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
