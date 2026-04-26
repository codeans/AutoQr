import { NativeModules, Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import type { IncomingCall } from "@/types/call";
import { callIdFromUuid, callUuidFromId } from "@/utils/callUuid";
import { pushTokenService } from "@/services/api/pushToken.service";

type NativeCallEventHandlers = {
  onAnswer?: (callId: string) => void;
  onEnd?: (callId: string) => void;
  onIncomingPayload?: (incoming: IncomingCall) => void;
};

type NativeCallActionHandler = (callId: string) => void;

type CallKeepModule = typeof import("react-native-callkeep").default;
type VoipNotificationModule = typeof import("react-native-voip-push-notification").default;

let configured = false;
let voipConfigured = false;
let subscriptions: Array<{ remove: () => void }> = [];
let callKeepModule: CallKeepModule | null | undefined;
let callKeepEndReasons:
  | typeof import("react-native-callkeep").CONSTANTS.END_CALL_REASONS
  | null
  | undefined;
const incomingByUuid = new Map<string, IncomingCall>();
const answerObservers = new Set<NativeCallActionHandler>();
const rejectObservers = new Set<NativeCallActionHandler>();

const fallbackEndCallReasons = {
  FAILED: 1,
  REMOTE_ENDED: 2,
  UNANSWERED: 3,
  ANSWERED_ELSEWHERE: 4,
  DECLINED_ELSEWHERE: 5,
  MISSED: 6
} as const;

function hasNativeCallKeepModule(): boolean {
  // In some RN New Architecture builds, touching NativeModules.RNCallKeep can throw
  // TurboModule parsing exceptions. Treat that as "module unavailable".
  try {
    return Boolean((NativeModules as Record<string, unknown>)?.RNCallKeep);
  } catch {
    return false;
  }
}

function getCallKeep(): CallKeepModule | null {
  if (callKeepModule !== undefined) return callKeepModule;
  // The package always exports a JS singleton; native methods read NativeModules.RNCallKeep,
  // which is missing in Expo Go. Treat as unavailable without loading the stub.
  if (Constants.appOwnership === "expo" || !hasNativeCallKeepModule()) {
    callKeepModule = null;
    callKeepEndReasons = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require("react-native-callkeep") as typeof import("react-native-callkeep");
    callKeepModule = module.default;
    callKeepEndReasons = module.CONSTANTS?.END_CALL_REASONS ?? null;
  } catch {
    callKeepModule = null;
    callKeepEndReasons = null;
  }
  return callKeepModule;
}

function getEndCallReasons() {
  if (callKeepEndReasons === undefined) {
    getCallKeep();
  }
  return callKeepEndReasons ?? fallbackEndCallReasons;
}

function getVoipPushNotification(): VoipNotificationModule | null {
  if (Platform.OS !== "ios") return null;
  try {
    // iOS-only native module; requiring it on Android throws because there is no native emitter.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-voip-push-notification").default as VoipNotificationModule;
  } catch {
    return null;
  }
}

function toIncomingCall(payload: any): IncomingCall | null {
  const rawId = payload?.callId ?? payload?.uuid;
  const callId = rawId ? callIdFromUuid(String(rawId)) : "";
  if (!callId) return null;
  return {
    callId,
    incidentId: String(payload?.incidentId ?? ""),
    vehicleId: payload?.vehicleId,
    vehiclePlate: payload?.vehiclePlate,
    callerPhone: payload?.callerPhone,
    incidentImages: Array.isArray(payload?.incidentImages) ? payload.incidentImages : [],
    ownerId: payload?.ownerId,
    status: payload?.status ?? "ringing",
    reporterSocketId: String(payload?.reporterSocketId ?? ""),
    reporterPhone: payload?.reporterPhone ?? payload?.callerPhone ?? payload?.handle ?? "",
    reporterName: payload?.reporterName,
    carId: payload?.carId ?? payload?.vehicleId,
    carLabel: payload?.carLabel ?? payload?.vehiclePlate ?? "",
    imageCount: typeof payload?.imageCount === "number" ? payload.imageCount : 0,
    message: payload?.message,
    platform: payload?.platform,
    createdAt: payload?.createdAt,
    expiresAt: payload?.expiresAt
  };
}

function rememberIncoming(incoming: IncomingCall): string {
  const uuid = callUuidFromId(incoming.callId);
  incomingByUuid.set(uuid, incoming);
  return uuid;
}

async function setupCallKeep(): Promise<void> {
  if (configured) return;
  const RNCallKeep = getCallKeep();
  if (!RNCallKeep) return;
  try {
    await RNCallKeep.setup({
      ios: {
        appName: "AutoQr",
        supportsVideo: false,
        includesCallsInRecents: false,
        ringtoneSound: "autoqr_ringtone.wav"
      },
      android: {
        alertTitle: "Phone account required",
        alertDescription: "AutoQr needs call account access to show incoming incident calls.",
        cancelButton: "Cancel",
        okButton: "Allow",
        additionalPermissions: [
          "android.permission.READ_CALL_LOG",
          "android.permission.MANAGE_OWN_CALLS",
          "android.permission.POST_NOTIFICATIONS",
          "android.permission.USE_FULL_SCREEN_INTENT",
          "android.permission.FOREGROUND_SERVICE",
          "android.permission.FOREGROUND_SERVICE_MICROPHONE"
        ],
        selfManaged: true,
        foregroundService: {
          channelId: "autoqr-calls",
          channelName: "AutoQr Calls",
          notificationTitle: "AutoQr call in progress",
          notificationIcon: "notification_icon"
        }
      }
    });
    if (Platform.OS === "android") {
      RNCallKeep.setAvailable(true);
    }
    configured = true;
  } catch {
    // Keep app usable even if native CallKeep is present but incompatible with runtime.
    callKeepModule = null;
    callKeepEndReasons = null;
    configured = false;
  }
}

export const nativeCallService = {
  async setupNativeCalling(): Promise<void> {
    await setupCallKeep();
  },

  async setup(): Promise<void> {
    await setupCallKeep();
  },

  registerEventHandlers(handlers: NativeCallEventHandlers): () => void {
    void setupCallKeep().catch(() => undefined);
    const RNCallKeep = getCallKeep();
    subscriptions.forEach((sub) => sub.remove());
    subscriptions = RNCallKeep
      ? [
          RNCallKeep.addEventListener("answerCall", ({ callUUID }: { callUUID: string }) => {
            const callId = callIdFromUuid(callUUID);
            handlers.onAnswer?.(callId);
            answerObservers.forEach((observer) => observer(callId));
          }),
          RNCallKeep.addEventListener("endCall", ({ callUUID }: { callUUID: string }) => {
            const callId = callIdFromUuid(callUUID);
            handlers.onEnd?.(callId);
            rejectObservers.forEach((observer) => observer(callId));
          }),
          RNCallKeep.addEventListener("didLoadWithEvents", (events: Array<{ name: string; data: unknown }>) => {
            events.forEach((event) => {
              const data = event.data as { callUUID?: string };
              if (event.name === "RNCallKeepPerformAnswerCallAction" && data?.callUUID) {
                const callId = callIdFromUuid(data.callUUID);
                handlers.onAnswer?.(callId);
                answerObservers.forEach((observer) => observer(callId));
              }
              if (event.name === "RNCallKeepPerformEndCallAction" && data?.callUUID) {
                const callId = callIdFromUuid(data.callUUID);
                handlers.onEnd?.(callId);
                rejectObservers.forEach((observer) => observer(callId));
              }
            });
            RNCallKeep.clearInitialEvents();
          })
        ]
      : [];

    const voip = getVoipPushNotification();
    if (voip) {
      voip.addEventListener("notification", (payload) => {
        const incoming = toIncomingCall(payload);
        if (!incoming) return;
        const uuid = rememberIncoming(incoming);
        handlers.onIncomingPayload?.(incoming);
        voip.onVoipNotificationCompleted(uuid);
      });
      voip.addEventListener("didLoadWithEvents", (events) => {
        events.forEach((event) => {
          if (event.name !== "RNVoipPushRemoteNotificationReceivedEvent") return;
          const incoming = toIncomingCall(event.data);
          if (!incoming) return;
          rememberIncoming(incoming);
          handlers.onIncomingPayload?.(incoming);
        });
      });
    }

    return () => {
      subscriptions.forEach((sub) => sub.remove());
      subscriptions = [];
      voip?.removeEventListener("notification");
      voip?.removeEventListener("didLoadWithEvents");
    };
  },

  async registerNativeTokens(): Promise<void> {
    if (Constants.appOwnership === "expo") return;
    if (Platform.OS === "android") {
      try {
        const token = await Notifications.getDevicePushTokenAsync();
        if (token?.data) {
          await pushTokenService.registerFcmToken({
            token: String(token.data),
            appVersion: Constants.expoConfig?.version ?? ""
          });
        }
      } catch {
        // Expo push remains registered as the fallback path.
      }
      return;
    }

    const voip = getVoipPushNotification();
    if (!voip || voipConfigured) return;
    voipConfigured = true;
    voip.addEventListener("register", (token) => {
      pushTokenService
        .register({
          token,
          platform: "ios",
          tokenType: "voip",
          appVersion: Constants.expoConfig?.version ?? ""
        })
        .catch(() => undefined);
    });
    voip.registerVoipToken();
  },

  async showIncomingCall(_incoming: IncomingCall): Promise<boolean> {
    const incoming = _incoming;
    await setupCallKeep();
    const RNCallKeep = getCallKeep();
    if (!RNCallKeep) return false;
    const uuid = rememberIncoming(incoming);
    RNCallKeep.displayIncomingCall(
      uuid,
      incoming.reporterPhone || incoming.callerPhone || "AutoQr caller",
      incoming.carLabel || "AutoQr incident call",
      "generic",
      false,
      { callId: incoming.callId }
    );
    return true;
  },

  async displayIncomingCall(incoming: IncomingCall): Promise<boolean> {
    return this.showIncomingCall(incoming);
  },

  async endIncomingCall(_callId: string): Promise<void> {
    const RNCallKeep = getCallKeep();
    if (!RNCallKeep) return;
    const uuid = callUuidFromId(_callId);
    incomingByUuid.delete(uuid);
    try {
      RNCallKeep.reportEndCallWithUUID(uuid, getEndCallReasons().REMOTE_ENDED);
    } catch {
      RNCallKeep.endCall(uuid);
    }
  },

  async endNativeCall(callId: string): Promise<void> {
    await this.endIncomingCall(callId);
  },

  answerNativeCall(callId: string): void {
    const RNCallKeep = getCallKeep();
    if (!RNCallKeep) return;
    const uuid = callUuidFromId(callId);
    try {
      RNCallKeep.answerIncomingCall(uuid);
    } catch {
      // Ignore unsupported methods on older native module versions.
    }
  },

  rejectNativeCall(callId: string): void {
    this.markCallEnded(callId, getEndCallReasons().DECLINED_ELSEWHERE);
  },

  handleNativeAnswer(handler: NativeCallActionHandler): () => void {
    answerObservers.add(handler);
    return () => {
      answerObservers.delete(handler);
    };
  },

  handleNativeReject(handler: NativeCallActionHandler): () => void {
    rejectObservers.add(handler);
    return () => {
      rejectObservers.delete(handler);
    };
  },

  cleanupNativeCall(): void {
    subscriptions.forEach((sub) => sub.remove());
    subscriptions = [];
    incomingByUuid.clear();
  },

  markCallActive(callId: string): void {
    const RNCallKeep = getCallKeep();
    if (!RNCallKeep) return;
    const uuid = callUuidFromId(callId);
    if (Platform.OS === "ios") return;
    try {
      RNCallKeep.setCurrentCallActive(uuid);
    } catch {
      // Android-only helper can be unavailable on older CallKeep builds.
    }
  },

  markCallEnded(callId: string, reason: number = getEndCallReasons().REMOTE_ENDED): void {
    const RNCallKeep = getCallKeep();
    if (!RNCallKeep) return;
    const uuid = callUuidFromId(callId);
    incomingByUuid.delete(uuid);
    try {
      RNCallKeep.reportEndCallWithUUID(uuid, reason);
    } catch {
      RNCallKeep.endCall(uuid);
    }
  }
};
