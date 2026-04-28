import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { socketBaseUrl } from "../../../lib/runtimeConfig";

export type CallPlatform = "web" | "android" | "ios";

export type IncomingCallPayload = {
  callId: string;
  incidentId: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  incidentImages?: string[];
  ownerId?: string;
  status?: string;
  reporterSocketId: string;
  reporterPhoneMasked?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: CallPlatform;
  createdAt?: string;
  callbackId?: string;
  agoraChannelName?: string;
  agoraUidCaller?: number;
  agoraUidReceiver?: number;
};

export type AgoraJoinPayload = {
  appId: string;
  token: string;
  channelName: string;
  uid: number;
  role: "publisher" | "subscriber";
  expiresAt: string;
  expiresInSeconds: number;
};

export type CallEndedPayload = {
  callId: string;
  duration?: number;
  reason?: string;
};

const baseSocketOptions = {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ["websocket", "polling"] as ("websocket" | "polling")[]
};

export const createOwnerCallSocket = (token: string): Socket =>
  io(socketBaseUrl, { ...baseSocketOptions, auth: { token } });

export const createReporterCallSocket = (incidentToken: string, reporterSessionToken: string): Socket =>
  io(socketBaseUrl, {
    ...baseSocketOptions,
    auth: { incidentToken, reporterSessionToken }
  });

/**
 * Signaling events abstracted behind named functions so a future
 * Android/iOS client can implement the same surface on top of a
 * different transport (e.g. FCM/APNs push + WebSocket).
 */
export const signaling = {
  requestCall(socket: Socket, payload: { ownerUserId: string; incidentId: string; platform: CallPlatform }) {
    socket.emit("call_requested", payload);
  },
  cancelCall(socket: Socket, callId: string) {
    socket.emit("call_cancel", { callId });
  },
  accept(socket: Socket, callId: string, platform: CallPlatform = "web") {
    socket.emit("call_accept", { callId, platform });
  },
  reject(socket: Socket, callId: string, reason?: string) {
    socket.emit("call_reject", { callId, reason });
  },
  endCall(socket: Socket, callId: string, targetSocketId?: string, reason?: string) {
    socket.emit("call_end", { callId, targetSocketId, reason });
  },
  callbackAccept(socket: Socket, callbackId: string) {
    socket.emit("callback:accepted", { callbackId });
  },
  callbackDecline(socket: Socket, callbackId: string) {
    socket.emit("callback:declined", { callbackId });
  }
};
