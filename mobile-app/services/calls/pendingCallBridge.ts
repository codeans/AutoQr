import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import type { AgoraJoinPayload } from "@/types/call";

/**
 * Outcomes that mark a callId as "no longer eligible to ring on this device".
 *
 * These mirror the values understood by the Android `HandledCallStore` so we keep
 * a single dedupe authority across native + JS.
 */
export type HandledCallOutcome = "accepted" | "declined" | "missed" | "ended";

export type PendingAcceptedCall = {
  callId: string;
  callerName?: string;
  handle?: string;
  callActionToken?: string;
  incidentId?: string;
  carLabel?: string;
  reporterPhone?: string;
  acceptedAt?: number;
  source?: string;
  shouldOpenCallScreen?: boolean;
  acceptedFromNative?: boolean;
  agora?: AgoraJoinPayload;
  agoraAppId?: string;
  agoraToken?: string;
  agoraChannelName?: string;
  channelName?: string;
  agoraUid?: number | string;
  agoraRole?: string;
  agoraExpiresAt?: string;
  agoraExpiresInSeconds?: number | string;
};

export type NativeActionResultEvent = {
  callId: string;
  action: string;
  success: boolean;
  httpStatus?: number;
};

export type IncomingUiClosedEvent = {
  callId: string;
  reason: string;
};

type CallBridgeNativeModule = {
  consumePendingAcceptedCall(): Promise<PendingAcceptedCall | null>;
  peekPendingAcceptedCall(): Promise<PendingAcceptedCall | null>;
  clearPendingAcceptedCall(callId: string | null): Promise<void>;
  markCallHandled(callId: string, outcome: HandledCallOutcome): Promise<boolean>;
  isCallHandled(callId: string): Promise<boolean>;
  clearHandledCall(callId: string | null): Promise<void>;
};

const PENDING_EVENT = "AutoQrCallBridge:PendingAcceptedCall";
const ACTION_RESULT_EVENT = "AutoQrCallBridge:NativeActionResult";
const UI_CLOSED_EVENT = "AutoQrCallBridge:IncomingUiClosed";

const handledCacheTtlMs = 10 * 60_000;
const handledCache = new Map<string, { outcome: HandledCallOutcome; ts: number }>();

function pruneHandledCache(): void {
  const now = Date.now();
  for (const [callId, entry] of handledCache.entries()) {
    if (now - entry.ts > handledCacheTtlMs) handledCache.delete(callId);
  }
}

function getNativeModule(): CallBridgeNativeModule | null {
  if (Platform.OS !== "android") return null;
  try {
    const mod = (NativeModules as Record<string, unknown>).AutoQrCallBridge;
    return (mod as CallBridgeNativeModule | undefined) ?? null;
  } catch {
    return null;
  }
}

function getEmitter(): NativeEventEmitter | null {
  const mod = getNativeModule();
  if (!mod) return null;
  try {
    return new NativeEventEmitter(NativeModules.AutoQrCallBridge as any);
  } catch {
    return null;
  }
}

function normalizePending(payload: PendingAcceptedCall | null | undefined): PendingAcceptedCall | null {
  if (!payload || typeof payload.callId !== "string" || !payload.callId) return null;
  const rawAgora = (payload as any).agora;
  const flatChannelName = (payload as any).channelName ?? (payload as any).agoraChannelName;
  const flatAgoraToken = (payload as any).agoraToken;
  const flatAgoraUid = Number((payload as any).agoraUid);
  const agoraRole = (value: unknown): AgoraJoinPayload["role"] => (value === "subscriber" ? "subscriber" : "publisher");
  const agora: AgoraJoinPayload | undefined =
    rawAgora && typeof rawAgora === "object" && typeof rawAgora.token === "string" && typeof rawAgora.channelName === "string"
      ? {
          appId: String(rawAgora.appId ?? ""),
          token: String(rawAgora.token),
          channelName: String(rawAgora.channelName),
          uid: Number(rawAgora.uid),
          role: agoraRole(rawAgora.role),
          expiresAt: String(rawAgora.expiresAt ?? ""),
          expiresInSeconds: Number(rawAgora.expiresInSeconds ?? 0)
        }
      : typeof flatAgoraToken === "string" && typeof flatChannelName === "string" && Number.isFinite(flatAgoraUid) && flatAgoraUid > 0
        ? {
            appId: String((payload as any).agoraAppId ?? ""),
            token: flatAgoraToken,
            channelName: flatChannelName,
            uid: flatAgoraUid,
            role: agoraRole((payload as any).agoraRole),
            expiresAt: String((payload as any).agoraExpiresAt ?? ""),
            expiresInSeconds: Number((payload as any).agoraExpiresInSeconds ?? 0)
          }
      : undefined;
  return {
    callId: payload.callId,
    callerName: payload.callerName || undefined,
    handle: payload.handle || undefined,
    callActionToken: payload.callActionToken || undefined,
    incidentId: payload.incidentId || undefined,
    carLabel: payload.carLabel || undefined,
    reporterPhone: payload.reporterPhone || undefined,
    acceptedAt: typeof payload.acceptedAt === "number" ? payload.acceptedAt : Date.now(),
    source: payload.source || "native",
    shouldOpenCallScreen: payload.shouldOpenCallScreen !== false,
    acceptedFromNative: payload.acceptedFromNative !== false,
    agora
  };
}

export const pendingCallBridge = {
  isAvailable(): boolean {
    return getNativeModule() !== null;
  },

  async consumePending(): Promise<PendingAcceptedCall | null> {
    const mod = getNativeModule();
    if (!mod) return null;
    try {
      const value = await mod.consumePendingAcceptedCall();
      const normalized = normalizePending(value ?? null);
      if (normalized) handledCache.set(normalized.callId, { outcome: "accepted", ts: Date.now() });
      return normalized;
    } catch {
      return null;
    }
  },

  async peekPending(): Promise<PendingAcceptedCall | null> {
    const mod = getNativeModule();
    if (!mod) return null;
    try {
      return normalizePending(await mod.peekPendingAcceptedCall());
    } catch {
      return null;
    }
  },

  async clearPending(callId?: string | null): Promise<void> {
    const mod = getNativeModule();
    if (!mod) return;
    try {
      await mod.clearPendingAcceptedCall(callId ?? null);
    } catch {
      // best-effort
    }
  },

  async markHandled(callId: string, outcome: HandledCallOutcome): Promise<void> {
    if (!callId) return;
    handledCache.set(callId, { outcome, ts: Date.now() });
    pruneHandledCache();
    const mod = getNativeModule();
    if (!mod) return;
    try {
      await mod.markCallHandled(callId, outcome);
    } catch {
      // best-effort
    }
  },

  isHandledLocally(callId: string | null | undefined): boolean {
    if (!callId) return false;
    pruneHandledCache();
    return handledCache.has(callId);
  },

  async isHandled(callId: string): Promise<boolean> {
    if (!callId) return false;
    if (this.isHandledLocally(callId)) return true;
    const mod = getNativeModule();
    if (!mod) return false;
    try {
      const handled = await mod.isCallHandled(callId);
      if (handled) handledCache.set(callId, { outcome: "ended", ts: Date.now() });
      return handled;
    } catch {
      return false;
    }
  },

  async clearHandled(callId?: string | null): Promise<void> {
    if (callId) handledCache.delete(callId);
    else handledCache.clear();
    const mod = getNativeModule();
    if (!mod) return;
    try {
      await mod.clearHandledCall(callId ?? null);
    } catch {
      // best-effort
    }
  },

  onPendingAcceptedCall(handler: (event: PendingAcceptedCall) => void): () => void {
    const emitter = getEmitter();
    if (!emitter) return () => undefined;
    const sub = emitter.addListener(PENDING_EVENT, (raw: PendingAcceptedCall) => {
      const normalized = normalizePending(raw);
      if (normalized) handler(normalized);
    });
    return () => sub.remove();
  },

  onNativeActionResult(handler: (event: NativeActionResultEvent) => void): () => void {
    const emitter = getEmitter();
    if (!emitter) return () => undefined;
    const sub = emitter.addListener(ACTION_RESULT_EVENT, handler);
    return () => sub.remove();
  },

  onIncomingUiClosed(handler: (event: IncomingUiClosedEvent) => void): () => void {
    const emitter = getEmitter();
    if (!emitter) return () => undefined;
    const sub = emitter.addListener(UI_CLOSED_EVENT, handler);
    return () => sub.remove();
  }
};
