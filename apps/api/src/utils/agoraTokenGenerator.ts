import agoraToken from "agora-token";
import { env } from "../config/env.js";
import { ApiError } from "./apiError.js";

const { RtcTokenBuilder, RtcRole } = agoraToken;

export type AgoraRole = "publisher" | "subscriber";

export type AgoraTokenPayload = {
  callId: string;
  channelName: string;
  role: AgoraRole;
  uid: number;
  expiresInSeconds?: number;
};

const DEFAULT_TOKEN_TTL_SECONDS = 60 * 60;

export const agoraChannelForCall = (callId: string) => `call_${callId}`;

export const agoraUidFor = (callId: string, participant: "caller" | "receiver") => {
  const seed = `${callId}:${participant}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) || (participant === "caller" ? 1 : 2);
};

export const generateAgoraRtcToken = ({
  callId,
  channelName,
  role,
  uid,
  expiresInSeconds = DEFAULT_TOKEN_TTL_SECONDS
}: AgoraTokenPayload) => {
  if (!env.AGORA_APP_ID || !env.AGORA_APP_CERTIFICATE) {
    throw new ApiError(503, "Agora is not configured");
  }
  if (channelName !== agoraChannelForCall(callId)) {
    throw new ApiError(400, "Invalid Agora channel for call");
  }

  const agoraRole = role === "subscriber" ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;
  const token = RtcTokenBuilder.buildTokenWithUid(
    env.AGORA_APP_ID,
    env.AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    agoraRole,
    expiresInSeconds,
    expiresInSeconds
  );
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000).toISOString();
  return { appId: env.AGORA_APP_ID, token, channelName, uid, role, expiresAt, expiresInSeconds };
};
