import apn from "apn";
import { UserModel } from "../../models/User.js";
import { logger } from "../../utils/logger.js";
import { callUuidFromId } from "../../utils/callUuid.js";
import { ensureFirebaseAdmin, firebaseAdmin } from "../firebase/admin.js";

type NativeCallPayload = {
  callId: string;
  incidentId: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  reporterSocketId?: string;
  reporterPhone?: string;
  reporterPhoneMasked?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: string;
  callActionToken?: string;
  createdAt?: string;
  expiresAt?: string;
  agoraAppId?: string;
  agoraToken?: string;
  agoraChannelName?: string;
  channelName?: string;
  agoraUid?: number;
  agoraUidCaller?: number;
  agoraUidReceiver?: number;
  agoraRole?: string;
  agoraExpiresAt?: string;
  agoraExpiresInSeconds?: number;
};

type NativeCallStateType = "INCOMING_CALL" | "CALL_ACCEPTED" | "MISSED_CALL" | "CALL_ENDED" | "call_missed" | "call_ended";

let apnProvider: apn.Provider | null | undefined;

function getApnProvider(): apn.Provider | null {
  if (apnProvider !== undefined) return apnProvider;
  const key = process.env.APN_VOIP_KEY || process.env.APN_VOIP_KEY_BASE64;
  const keyId = process.env.APN_KEY_ID;
  const teamId = process.env.APN_TEAM_ID;
  if (!key || !keyId || !teamId) {
    apnProvider = null;
    return apnProvider;
  }
  const keyValue = process.env.APN_VOIP_KEY_BASE64 ? Buffer.from(key, "base64").toString("utf8") : key;
  apnProvider = new apn.Provider({
    token: { key: keyValue, keyId, teamId },
    production: process.env.APN_PRODUCTION === "true"
  });
  return apnProvider;
}

function serializeCallStatePayload(payload: NativeCallPayload, stateType: NativeCallStateType): Record<string, string> {
  const uuid = callUuidFromId(payload.callId);
  const base: Record<string, string> = {
    uuid,
    callId: payload.callId,
    incidentId: payload.incidentId,
    type: stateType
  };

  // Incoming calls need callerName/handle for the Android full-screen notification UX.
  if (stateType === "INCOMING_CALL") {
    base.callerName = payload.carLabel || "AutoQr incident call";
    base.handle = payload.reporterPhoneMasked || payload.reporterPhone || payload.callerPhone || "AutoQr caller";
  }

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    // Keep the stateType we set above; everything else is caller-provided data.
    if (key === "callId" || key === "incidentId") return;
    base[key] = String(value);
  });
  return base;
}

async function sendVoipPush(tokens: string[], payload: NativeCallPayload): Promise<void> {
  const provider = getApnProvider();
  const topic = process.env.APN_VOIP_TOPIC || `${process.env.IOS_BUNDLE_ID || "de.autoqr.app"}.voip`;
  if (!provider || tokens.length === 0) return;

  const notification = new apn.Notification();
  notification.topic = topic;
  notification.priority = 10;
  notification.expiry = Math.floor(Date.now() / 1000) + 45;
  notification.payload = serializeCallStatePayload(payload, "INCOMING_CALL");
  const notificationWithHeaders = notification as apn.Notification & { headers: () => Record<string, string | number> };
  const originalHeaders = notificationWithHeaders.headers.bind(notification);
  notificationWithHeaders.headers = () => ({
    ...originalHeaders(),
    "apns-push-type": "voip"
  });

  const result = await provider.send(notification, tokens);
  if (result.failed.length > 0) {
    logger.warn("native_call.apn_voip_failed", { count: result.failed.length, reasons: result.failed.map((f) => f.response?.reason || f.error?.message) });
  }
}

async function sendFcmPush(tokens: string[], payload: NativeCallPayload, stateType: NativeCallStateType): Promise<void> {
  if (tokens.length === 0 || !ensureFirebaseAdmin()) return;
  const data = serializeCallStatePayload(payload, stateType);
  const result = await firebaseAdmin.messaging().sendEachForMulticast({
    tokens,
    data,
    android: {
      priority: "high",
      ttl: 45_000
    },
    apns: {
      headers: {
        "apns-priority": "10"
      }
    }
  });
  if (result.failureCount > 0) {
    logger.warn("native_call.fcm_failed", { failureCount: result.failureCount });
  }
}

export async function sendNativeCallStateToUser(userId: string, payload: NativeCallPayload, stateType: NativeCallStateType): Promise<void> {
  try {
    const user = await UserModel.findById(userId).select("pushTokens notificationPreferences").lean();
    if (!user || user.notificationPreferences?.push === false) return;
    const tokens = Array.isArray(user.pushTokens) ? user.pushTokens : [];
    const voipTokens = tokens.filter((t: any) => t?.tokenType === "voip" && t?.platform === "ios").map((t: any) => t.token).filter(Boolean);
    const fcmTokens = tokens.filter((t: any) => t?.tokenType === "fcm" && t?.platform === "android").map((t: any) => t.token).filter(Boolean);

    if (stateType === "INCOMING_CALL") {
      await Promise.all([sendVoipPush(voipTokens, payload), sendFcmPush(fcmTokens, payload, stateType)]);
      return;
    }

    await sendFcmPush(fcmTokens, payload, stateType);
  } catch (err) {
    logger.warn("native_call.push_failed", { userId, err: (err as Error).message });
  }
}

export async function sendNativeIncomingCallToUser(userId: string, payload: NativeCallPayload): Promise<void> {
  await sendNativeCallStateToUser(userId, payload, "INCOMING_CALL");
}
