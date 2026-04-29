import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import type { FirebaseMessagingTypes } from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { pushTokenService } from "@/services/api/pushToken.service";
import { requestNotificationPermission as requestNotificationPermissionFromExpo } from "@/services/notifications/notificationService";
import { StorageKeys } from "@/constants/storage";
import { secureStorage } from "@/utils/secureStorage";
import { router } from "expo-router";
import { handleIncomingCall, handleIncomingCallTap, isCallHandled } from "@/features/calls/incomingCallNotificationHandler";
import { cleanupIncomingCall } from "@/features/calls/backgroundCallHandler";
import type { IncomingCall } from "@/types/call";

type IncomingCallPayload = {
  type?: string;
  callId?: string;
  incidentId?: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  reporterSocketId?: string;
  reporterPhone?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number | string;
  message?: string;
  platform?: "web" | "android" | "ios";
  createdAt?: string;
  expiresAt?: string;
  agoraChannel?: string;
  agoraChannelName?: string;
  incidentImages?: string[];
};

let backgroundHandlerRegistered = false;

type CallStatePayload = {
  type: string;
  callId: string;
  incidentId?: string;
  expiresAt?: string;
};

const cleanedCallIds = new Map<string, number>();
const isRecentlyCleaned = (callId: string) => {
  const ts = cleanedCallIds.get(callId);
  if (!ts) return false;
  return Date.now() - ts < 2 * 60_000;
};

function parseIncomingPayload(payload: Record<string, unknown>): IncomingCallPayload | null {
  const type = String(payload.type ?? "");
  const callId = String(payload.callId ?? "");
  if (type !== "INCOMING_CALL" || !callId) return null;

  const rawImages = payload.incidentImages;
  let incidentImages: string[] | undefined;
  if (Array.isArray(rawImages)) {
    incidentImages = rawImages.map(String);
  } else if (typeof rawImages === "string") {
    try {
      const parsed = JSON.parse(rawImages);
      if (Array.isArray(parsed)) incidentImages = parsed.map(String);
    } catch {
      incidentImages = undefined;
    }
  }

  return {
    type,
    callId,
    incidentId: typeof payload.incidentId === "string" ? payload.incidentId : undefined,
    vehicleId: typeof payload.vehicleId === "string" ? payload.vehicleId : undefined,
    vehiclePlate: typeof payload.vehiclePlate === "string" ? payload.vehiclePlate : undefined,
    callerPhone: typeof payload.callerPhone === "string" ? payload.callerPhone : undefined,
    reporterSocketId: typeof payload.reporterSocketId === "string" ? payload.reporterSocketId : undefined,
    reporterPhone: typeof payload.reporterPhone === "string" ? payload.reporterPhone : undefined,
    reporterName: typeof payload.reporterName === "string" ? payload.reporterName : undefined,
    carId: typeof payload.carId === "string" ? payload.carId : undefined,
    carLabel: typeof payload.carLabel === "string" ? payload.carLabel : undefined,
    imageCount: typeof payload.imageCount === "number" || typeof payload.imageCount === "string" ? payload.imageCount : undefined,
    message: typeof payload.message === "string" ? payload.message : undefined,
    platform:
      payload.platform === "android" || payload.platform === "ios" || payload.platform === "web"
        ? payload.platform
        : undefined,
    createdAt: typeof payload.createdAt === "string" ? payload.createdAt : undefined,
    expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : undefined,
    agoraChannel: typeof payload.agoraChannel === "string" ? payload.agoraChannel : undefined,
    agoraChannelName: typeof payload.agoraChannelName === "string" ? payload.agoraChannelName : undefined,
    incidentImages
  };
}

function parseCallStatePayload(payload: Record<string, unknown>): CallStatePayload | null {
  const rawType = String(payload.type ?? "");
  const type = rawType.trim();
  const callId = String(payload.callId ?? payload.uuid ?? "");
  if (!type || !callId) return null;

  // Accept legacy/alternate casing pushed by older clients.
  const allowed = new Set([
    "INCOMING_CALL",
    "MISSED_CALL",
    "CALL_ENDED",
    "call_missed",
    "call_ended"
  ]);
  if (!allowed.has(type)) {
    // Some backends may send lowercase or mixed case; normalize a bit.
    const normalized = type.toUpperCase();
    if (!["INCOMING_CALL", "MISSED_CALL", "CALL_ENDED"].includes(normalized)) return null;
    return { type: normalized, callId, incidentId: typeof payload.incidentId === "string" ? payload.incidentId : undefined };
  }

  // Only include incidentId if present.
  const incidentId = typeof payload.incidentId === "string" ? payload.incidentId : undefined;
  return { type, callId, incidentId, expiresAt: typeof payload.expiresAt === "string" ? payload.expiresAt : undefined };
}

function getMessagingModule(): typeof import("@react-native-firebase/messaging").default | null {
  if (Constants.appOwnership === "expo") return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("@react-native-firebase/messaging").default as typeof import("@react-native-firebase/messaging").default;
  } catch {
    return null;
  }
}

async function handleCallStateFromPayload(payload: Record<string, unknown>): Promise<void> {
  const type = String(payload.type ?? "");
  const parsedIncoming = parseIncomingPayload(payload);
  const state = parseCallStatePayload(payload);

  if (parsedIncoming?.callId && (type === "INCOMING_CALL" || state?.type === "INCOMING_CALL")) {
    if (isCallHandled(parsedIncoming.callId)) return;
    const normalizedPayload: Partial<IncomingCall> & { callId: string } = {
      callId: parsedIncoming.callId,
      incidentId: parsedIncoming.incidentId,
      vehicleId: parsedIncoming.vehicleId ?? parsedIncoming.carId,
      vehiclePlate: parsedIncoming.vehiclePlate,
      callerPhone: parsedIncoming.callerPhone,
      reporterSocketId: parsedIncoming.reporterSocketId,
      reporterPhone: parsedIncoming.reporterPhone ?? parsedIncoming.callerPhone,
      reporterName: parsedIncoming.reporterName,
      carId: parsedIncoming.carId ?? parsedIncoming.vehicleId,
      carLabel: parsedIncoming.carLabel ?? parsedIncoming.vehiclePlate,
      imageCount: typeof parsedIncoming.imageCount === "string" ? Number(parsedIncoming.imageCount) : parsedIncoming.imageCount,
      message: parsedIncoming.message,
      platform: parsedIncoming.platform,
      createdAt: parsedIncoming.createdAt,
      expiresAt: parsedIncoming.expiresAt,
      incidentImages: parsedIncoming.incidentImages
    };
    await handleIncomingCall(normalizedPayload);
    return;
  }

  if (!state) return;

  // Missed/end: stop ringtone + dismiss CallKeep UI.
  if (state.type === "MISSED_CALL" || state.type === "CALL_ENDED" || state.type === "call_missed" || state.type === "call_ended") {
    if (isRecentlyCleaned(state.callId)) return;
    cleanedCallIds.set(state.callId, Date.now());
    await cleanupIncomingCall(state.callId).catch(() => undefined);

    // When launched from a background FCM data message, navigate to history so UI is coherent.
    if (state.type === "MISSED_CALL" || state.type === "call_missed") {
      try {
        router.push("/call/history" as never);
      } catch {
        // ignore
      }
    }
  }
}

export async function routeIncomingCallNotification(payload: Record<string, unknown>): Promise<void> {
  await handleCallStateFromPayload(payload);
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "android") {
    return requestNotificationPermissionFromExpo();
  }
  // iOS permissions are requested via FCM messaging().requestPermission()
  return true;
}

export async function getFCMToken(): Promise<string | null> {
  const messaging = getMessagingModule();
  if (!messaging) return null;
  try {
    await messaging().registerDeviceForRemoteMessages();
    const token = await messaging().getToken();
    return token || null;
  } catch {
    return null;
  }
}

export async function registerFCMTokenWithBackend(params: { token: string; platform: "android"; deviceId?: string }): Promise<void> {
  const { token, platform, deviceId } = params;
  if (!token) return;
  await pushTokenService.registerFcmToken({
    token,
    platform,
    deviceId: deviceId ?? "",
    appVersion: Constants.expoConfig?.version ?? ""
  });
}

let tokenRefreshListenerRegistered = false;
let tokenRefreshUnsubscribe: null | (() => void) = null;

export function refreshFCMTokenHandler(): void {
  const messaging = getMessagingModule();
  if (!messaging || tokenRefreshListenerRegistered) return;
  tokenRefreshListenerRegistered = true;
  tokenRefreshUnsubscribe = messaging().onTokenRefresh(async (token) => {
    if (!token) return;
    currentFcmToken = token;
    await secureStorage.set(StorageKeys.fcmToken, token);
    await registerFCMTokenWithBackend({ token, platform: "android", deviceId: (Device as any).osBuildId });
  });
}

let currentFcmToken: string | null = null;

export async function sendTokenToBackend(token: string): Promise<void> {
  // Kept for backward compatibility with existing codepaths.
  if (!token) return;
  const deviceId = (Device as any).osBuildId ?? "";
  await registerFCMTokenWithBackend({ token, platform: "android", deviceId });
}

export async function registerFCMToken(): Promise<string | null> {
  const messaging = getMessagingModule();
  if (!messaging) return null;
  try {
    void refreshFCMTokenHandler();

    // Android requires runtime permission to show notifications.
    const ok = await requestNotificationPermission();
    if (!ok) return null;

    await messaging().registerDeviceForRemoteMessages();
    if (Platform.OS === "ios") {
      await messaging().requestPermission();
    }

    const token = await getFCMToken();
    if (!token) return null;
    currentFcmToken = token;
    await secureStorage.set(StorageKeys.fcmToken, token);
    await sendTokenToBackend(token);
    return token;
  } catch {
    return null;
  }
}

export async function registerDeviceForCalls(): Promise<string | null> {
  return registerFCMToken();
}

export function handleForegroundMessage(): (() => void) | null {
  const messaging = getMessagingModule();
  if (!messaging) return null;
  const unsubscribe = messaging().onMessage(async (message) => {
    await routeIncomingCallNotification((message.data as Record<string, unknown>) ?? {});
  });
  return unsubscribe;
}

export function handleBackgroundMessage(): void {
  const messaging = getMessagingModule();
  if (!messaging || backgroundHandlerRegistered) return;
  messaging().setBackgroundMessageHandler(async (message: FirebaseMessagingTypes.RemoteMessage) => {
    await routeIncomingCallNotification((message.data as Record<string, unknown>) ?? {});
  });
  backgroundHandlerRegistered = true;
}

export async function handleKilledAppLaunch(): Promise<void> {
  const messaging = getMessagingModule();
  if (messaging) {
    const initialMessage = await messaging().getInitialNotification();
    if (initialMessage?.data) {
      const payload = initialMessage.data as Record<string, unknown>;
      const incoming = parseIncomingPayload(payload);
      if (incoming?.callId) {
        await handleIncomingCallTap(incoming.callId, {
          ...incoming,
          imageCount: typeof incoming.imageCount === "string" ? Number(incoming.imageCount) : incoming.imageCount
        });
        return;
      }

      const state = parseCallStatePayload(payload);
      if (state && (state.type === "MISSED_CALL" || state.type === "CALL_ENDED" || state.type === "call_missed" || state.type === "call_ended")) {
        await cleanupIncomingCall(state.callId).catch(() => undefined);
        try {
          router.push("/call/history" as never);
        } catch {
          // ignore
        }
        return;
      }
    }
  }

  const response = await Notifications.getLastNotificationResponseAsync();
  const payload = (response?.notification?.request?.content?.data ?? {}) as Record<string, unknown>;
  const incoming = parseIncomingPayload(payload);
  if (incoming?.callId) {
    await handleIncomingCallTap(incoming.callId, {
      ...incoming,
      imageCount: typeof incoming.imageCount === "string" ? Number(incoming.imageCount) : incoming.imageCount
    });
    return;
  }

  const state = parseCallStatePayload(payload);
  if (state && (state.type === "MISSED_CALL" || state.type === "CALL_ENDED" || state.type === "call_missed" || state.type === "call_ended")) {
    await cleanupIncomingCall(state.callId).catch(() => undefined);
    try {
      router.push("/call/history" as never);
    } catch {
      // ignore
    }
  }
}

export function initializeFcmBackgroundHandling(): void {
  handleBackgroundMessage();
}

export async function unregisterFCMTokenOnLogout(): Promise<void> {
  const token = currentFcmToken ?? (await secureStorage.get(StorageKeys.fcmToken));
  if (!token) return;
  try {
    await pushTokenService.unregisterFcmToken(token);
  } catch {
    // Best-effort; token might already be invalid.
  }
  currentFcmToken = null;
  tokenRefreshUnsubscribe?.();
  tokenRefreshUnsubscribe = null;
  tokenRefreshListenerRegistered = false;
  await secureStorage.remove(StorageKeys.fcmToken);
}
