import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { CallSessionModel } from "../models/CallSession.js";
import { CallbackModel } from "../models/Callback.js";
import { IncidentModel } from "../models/Incident.js";
import { NotificationModel } from "../models/Notification.js";
import { CarModel } from "../models/Car.js";
import { logger } from "../utils/logger.js";
import { maskGermanPhone } from "@autoqr/shared";
import { buildAgoraJoinPayload, ensureAgoraFields } from "../services/agora/agora.service.js";

type SocketAuth = {
  userId?: string;
  role?: "owner" | "admin";
  incidentId?: string;
  reporterSessionId?: string;
  reporterSessionToken?: string;
};

const onlineUsers = new Map<string, Set<string>>();
const socketAuthById = new Map<string, SocketAuth>();

let ioInstance: Server | null = null;
const RINGING_TIMEOUT_MS = 45_000;
const REPORTER_DISCONNECT_GRACE_MS = 12_000;

const addOnlineUserSocket = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId) ?? new Set<string>();
  sockets.add(socketId);
  onlineUsers.set(userId, sockets);
};

const removeOnlineUserSocket = (userId: string, socketId: string) => {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;
  sockets.delete(socketId);
  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
};

const getOnlineUserSockets = (userId: string) => onlineUsers.get(userId) ?? new Set<string>();

const isSocketForCallOwner = (socketId: string, ownerUserId: string) => {
  const targetAuth = socketAuthById.get(socketId);
  return !!targetAuth?.userId && targetAuth.userId === ownerUserId;
};

export const getPreferredUserSocketId = (userId: string, preferredSocketId?: string) => {
  if (preferredSocketId && isSocketForCallOwner(preferredSocketId, userId)) {
    return preferredSocketId;
  }
  return getOnlineUserSockets(userId).values().next().value ?? "";
};

export const emitToUserExcept = (userId: string, excludedSocketId: string, event: string, payload: unknown) => {
  if (!ioInstance) return;
  for (const socketId of getOnlineUserSockets(userId)) {
    if (socketId !== excludedSocketId) {
      ioInstance.to(socketId).emit(event, payload);
    }
  }
};

const callRequestedSchema = z.object({
  ownerUserId: z.string().min(1),
  incidentId: z.string().min(1),
  platform: z.enum(["web", "android", "ios"]).optional().default("web")
});

const callActionSchema = z.object({
  callId: z.string().min(1),
  platform: z.enum(["web", "android", "ios"]).optional()
});

const callbackActionSchema = z.object({
  callbackId: z.string().min(1)
});

const isIncidentReporterAuth = (a: SocketAuth | undefined, call: { incidentId: unknown }) =>
  Boolean(a && !a.userId && a.incidentId && String(call.incidentId) === a.incidentId);

const isReporterSocket = (socketId: string, auth: SocketAuth | undefined, call: any) =>
  call.reporterSessionId === socketId || isIncidentReporterAuth(auth, call);

const getCallForSocket = async (socketId: string, callId: string) => {
  const call = await CallSessionModel.findById(callId);
  if (!call) return null;
  const auth = socketAuthById.get(socketId);
  if (!auth) return null;
  const isOwner = !!auth.userId && String(call.ownerUserId) === auth.userId;
  const isReporter = isReporterSocket(socketId, auth, call);
  if (!isOwner && !isReporter) return null;
  return call;
};

const isCallActive = (status: string) => ["ringing", "accepted", "active", "connected"].includes(status);

const buildIncomingCallPayload = async (call: any, incidentId: string, reporterSocketId: string) => {
  ensureAgoraFields(call);
  const incident = await IncidentModel.findById(incidentId).lean();
  let carLabel = "";
  let vehiclePlate = "";
  let vehicleId = "";
  if (incident?.carId) {
    const car = await CarModel.findById(incident.carId).lean();
    if (car) {
      const nickname = car.nickname || "";
      const make = car.make || "";
      const model = car.model || "";
      vehicleId = String(car._id);
      vehiclePlate = car.registrationNumber || "";
      carLabel = [nickname, [make, model].filter(Boolean).join(" ")].filter(Boolean).join(" · ") || make || model || "";
    }
  }
  const phone = incident?.reporterPhone || "";
  const createdAtIso =
    call.createdAt instanceof Date
      ? call.createdAt.toISOString()
      : typeof call.createdAt === "string"
        ? call.createdAt
        : new Date().toISOString();
  const expiresAt = new Date(new Date(createdAtIso).getTime() + RINGING_TIMEOUT_MS).toISOString();
  return {
    callId: String(call._id),
    incidentId,
    vehicleId,
    vehiclePlate,
    callerPhone: phone,
    incidentImages: Array.isArray(incident?.images) ? incident.images : [],
    ownerId: String(call.ownerUserId),
    status: call.status || "ringing",
    createdAt: createdAtIso,
    expiresAt,
    // Legacy aliases consumed by existing web/mobile clients.
    reporterSocketId,
    reporterPhone: phone,
    reporterPhoneMasked: phone ? maskGermanPhone(phone) : "",
    carId: incident?.carId ? String(incident.carId) : "",
    carLabel,
    imageCount: Array.isArray(incident?.images) ? incident?.images.length : 0,
    message: incident?.message || "",
    platform: call.reporterPlatform || "web",
    agoraChannelName: call.agoraChannelName,
    agoraUidCaller: call.agoraUidCaller,
    agoraUidReceiver: call.agoraUidReceiver
  };
};

export const createSocketServer = (server: HttpServer) => {
  ioInstance = new Server(server, {
    cors: { origin: env.CORS_ORIGIN_LIST, credentials: true },
    pingTimeout: env.SOCKET_PING_TIMEOUT_MS,
    pingInterval: env.SOCKET_PING_INTERVAL_MS,
    transports: ["polling", "websocket"]
  });

  ioInstance.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    const incidentToken = socket.handshake.auth?.incidentToken as string | undefined;
    const reporterSessionToken = socket.handshake.auth?.reporterSessionToken as string | undefined;
    try {
      if (token) {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketAuth;
        socket.data.auth = decoded;
        socketAuthById.set(socket.id, decoded);
        return next();
      }
      if (incidentToken) {
        const query: Record<string, unknown> = { _id: incidentToken };
        if (reporterSessionToken) {
          query.reporterSessionToken = reporterSessionToken;
        }
        const incident = await IncidentModel.findOne(query).select("_id userId reporterSessionToken");
        if (!incident) {
          return next(new Error("Unauthorized"));
        }
        if (reporterSessionToken && incident.reporterSessionToken !== reporterSessionToken) {
          return next(new Error("Unauthorized"));
        }
        socket.data.auth = {
          incidentId: String(incident.id),
          reporterSessionId: socket.id,
          reporterSessionToken
        };
        socketAuthById.set(socket.id, socket.data.auth as SocketAuth);
        return next();
      }
    } catch {
      return next(new Error("Unauthorized"));
    }
    return next(new Error("Unauthorized"));
  });

  ioInstance.on("connection", (socket) => {
    const auth = socket.data.auth as SocketAuth;
    if (auth.userId) {
      addOnlineUserSocket(auth.userId, socket.id);
      socket.join(`user:${auth.userId}`);
      logger.info("socket.user_connected", { userId: auth.userId, socketId: socket.id });
      logger.info("socket.user_joined_room", { userId: auth.userId, room: `user:${auth.userId}` });
      ioInstance?.to(`user:${auth.userId}`).emit("user_online", { userId: auth.userId });
    }
    if (auth.incidentId) {
      socket.join(`incident:${auth.incidentId}`);
      logger.info("socket.incident_joined_room", { incidentId: auth.incidentId, socketId: socket.id });
      void CallSessionModel.updateMany(
        { incidentId: auth.incidentId, status: { $in: ["ringing", "accepted", "active", "connected"] } },
        { $set: { reporterSessionId: socket.id } }
      ).catch((err) => logger.warn("call.reporter_session_rebind_failed", { err: (err as Error)?.message }));
    }

    socket.on("call_requested", async (payload) => {
      const parsed = callRequestedSchema.safeParse(payload);
      if (!parsed.success || auth.userId) {
        return;
      }
      const { ownerUserId, incidentId, platform } = parsed.data;
      if (auth.incidentId !== incidentId) {
        return;
      }
      const incident = await IncidentModel.findById(incidentId).select("userId reporterPhone reporterName");
      if (!incident || String(incident.userId) !== ownerUserId) {
        return;
      }
      // Idempotency guard: if the reporter retries while a call is still live,
      // reuse the existing session instead of creating duplicate ringing calls.
      const existingLiveCall = await CallSessionModel.findOneAndUpdate(
        {
          incidentId,
          ownerUserId,
          status: { $in: ["ringing", "accepted", "active", "connected"] }
        },
        { $set: { reporterSessionId: socket.id } },
        { new: true, sort: { createdAt: -1 } }
      );
      if (existingLiveCall) {
        const ringingPayload = await buildIncomingCallPayload(existingLiveCall, incidentId, existingLiveCall.reporterSessionId || socket.id);
        const agora = buildAgoraJoinPayload(existingLiveCall, "caller");
        await existingLiveCall.save();
        socket.emit("call_requested", {
          callId: existingLiveCall.id,
          status: existingLiveCall.status || "ringing",
          delivery: "existing_session",
          agora
        });
        if (getOnlineUserSockets(ownerUserId).size > 0) {
          ioInstance?.to(`user:${ownerUserId}`).emit("call:incoming", ringingPayload);
        }
        logger.info("call.reused_existing_session", {
          callId: existingLiveCall.id,
          incidentId,
          ownerUserId,
          reporterSocketId: socket.id
        });
        return;
      }
      let call;
      try {
        call = await CallSessionModel.create({
          incidentId,
          ownerUserId,
          reporterSessionId: socket.id,
          reporterPhone: incident.reporterPhone || "",
          reporterPlatform: platform,
          status: "ringing",
          pushStatus: "pending"
        });
        ensureAgoraFields(call);
        await call.save();
      } catch (err) {
        if ((err as { code?: number })?.code !== 11000) throw err;
        const racedCall = await CallSessionModel.findOneAndUpdate(
          {
          incidentId,
          ownerUserId,
          status: { $in: ["ringing", "accepted", "active", "connected"] }
        },
          { $set: { reporterSessionId: socket.id } },
          { new: true, sort: { createdAt: -1 } }
        );
        if (!racedCall) throw err;
        const ringingPayload = await buildIncomingCallPayload(racedCall, incidentId, racedCall.reporterSessionId || socket.id);
        const agora = buildAgoraJoinPayload(racedCall, "caller");
        await racedCall.save();
        socket.emit("call_requested", {
          callId: racedCall.id,
          status: racedCall.status || "ringing",
          delivery: "existing_session",
          agora
        });
        if (getOnlineUserSockets(ownerUserId).size > 0) {
          ioInstance?.to(`user:${ownerUserId}`).emit("call:incoming", ringingPayload);
        }
        logger.info("call.reused_raced_session", {
          callId: racedCall.id,
          incidentId,
          ownerUserId,
          reporterSocketId: socket.id
        });
        return;
      }
      logger.info("call.created", { callId: call.id, incidentId, ownerUserId, reporterSocketId: socket.id });
      const ownerOnline = getOnlineUserSockets(ownerUserId).size > 0;
      const ringingPayload = await buildIncomingCallPayload(call, incidentId, socket.id);
      const callerAgora = buildAgoraJoinPayload(call, "caller");
      socket.emit("call_requested", { callId: call.id, status: "ringing", delivery: ownerOnline ? "socket_push" : "push", agora: callerAgora });
      if (ownerOnline) {
        ioInstance?.to(`user:${ownerUserId}`).emit("call:incoming", ringingPayload);
        ioInstance?.to(`user:${ownerUserId}`).emit("call_ringing", ringingPayload);
        logger.info("call.incoming_emitted", { callId: call.id, ownerUserId, event: "call:incoming" });
      }
      try {
        const { publishNotification } = await import("../infrastructure/notifications/realtime.notifications.js");
        const { sendNativeIncomingCallToUser } = await import("../infrastructure/notifications/nativeCall.push.js");
        const createdAtIso =
          ringingPayload.createdAt instanceof Date
            ? ringingPayload.createdAt.toISOString()
            : typeof ringingPayload.createdAt === "string"
              ? ringingPayload.createdAt
              : new Date().toISOString();
        const expiresAt = new Date(new Date(createdAtIso).getTime() + RINGING_TIMEOUT_MS).toISOString();
        const nativePayload = {
          callId: String(call._id),
          incidentId,
          vehicleId: ringingPayload.vehicleId || "",
          vehiclePlate: ringingPayload.vehiclePlate || "",
          callerPhone: incident.reporterPhone || "",
          reporterSocketId: socket.id,
          reporterPhone: incident.reporterPhone || "",
          reporterPhoneMasked: ringingPayload.reporterPhoneMasked || "",
          reporterName: incident.reporterName || "",
          carId: ringingPayload.carId || "",
          carLabel: ringingPayload.carLabel || "",
          imageCount: ringingPayload.imageCount || 0,
          message: ringingPayload.message || "",
          platform: ringingPayload.platform || "web",
          agoraChannelName: ringingPayload.agoraChannelName || "",
          agoraUidCaller: ringingPayload.agoraUidCaller || 0,
          agoraUidReceiver: ringingPayload.agoraUidReceiver || 0,
          createdAt: createdAtIso,
          expiresAt
        };
        await sendNativeIncomingCallToUser(ownerUserId, nativePayload);
        await publishNotification({
          userId: ownerUserId,
          type: "INCOMING_CALL",
          title: "Incoming AutoQr Call",
          body: "Someone is trying to contact you about your vehicle.",
          relatedEntityId: incidentId,
          data: {
            ...nativePayload,
            screen: "IncomingCall",
            incidentImages: ringingPayload.incidentImages || [],
            ownerId: ownerUserId,
            status: "ringing",
            agoraChannelName: ringingPayload.agoraChannelName || "",
            agoraUidCaller: ringingPayload.agoraUidCaller || 0,
            agoraUidReceiver: ringingPayload.agoraUidReceiver || 0,
            type: "INCOMING_CALL"
          },
          forcePush: true,
          channelId: "incoming-calls",
          priority: "high",
          ttl: Math.ceil(RINGING_TIMEOUT_MS / 1000)
        });
        call.pushStatus = "sent";
        call.pushSentAt = new Date();
        call.pushError = "";
        await call.save();
        logger.info("call.incoming_push_sent", { callId: call.id, ownerUserId });
      } catch (err) {
        call.pushStatus = "failed";
        call.pushError = (err as Error)?.message || "push_failed";
        await call.save();
        logger.warn("call.incoming.push_failed", { err: (err as Error)?.message });
      }
      setTimeout(async () => {
        try {
          const latest = await CallSessionModel.findById(call.id);
          if (!latest || latest.status !== "ringing") return;
          latest.status = "missed";
          latest.endedAt = new Date();
          latest.agoraDisconnectedAt = latest.endedAt;
          latest.endReason = "timeout";
          await latest.save();
          ioInstance?.to(`incident:${incidentId}`).emit("call:missed", { callId: latest.id, reason: "timeout" });
          ioInstance?.to(`incident:${incidentId}`).emit("call_missed", { callId: latest.id, reason: "timeout" });
          ioInstance?.to(`user:${ownerUserId}`).emit("call:missed", { callId: latest.id, reason: "timeout" });
          ioInstance?.to(`user:${ownerUserId}`).emit("call_missed", { callId: latest.id, reason: "timeout" });
          const { publishNotification } = await import("../infrastructure/notifications/realtime.notifications.js");
          await publishNotification({
            userId: ownerUserId,
            type: "MISSED_CALL",
            title: "Missed incident call",
            body: `Missed call from ${maskGermanPhone(incident.reporterPhone || "")}`,
            relatedEntityId: incidentId,
            data: { callId: String(latest._id), incidentId, type: "MISSED_CALL" },
            channelId: "calls",
            forcePush: true
          });

          // For killed/backgrounded Android clients we also send a raw FCM data message
          // so the native full-screen notification and CallKeep UI get dismissed.
          try {
            const { sendNativeCallStateToUser } = await import("../infrastructure/notifications/nativeCall.push.js");
            await sendNativeCallStateToUser(
              String(ownerUserId),
              { callId: String(latest._id), incidentId: String(incidentId) },
              "MISSED_CALL"
            );
          } catch (err) {
            logger.warn("call.ringing_timeout_fcm_failed", { callId: call.id, err: (err as Error)?.message });
          }
        } catch (err) {
          logger.warn("call.ringing_timeout_failed", { callId: call.id, err: (err as Error)?.message });
        }
      }, RINGING_TIMEOUT_MS);
    });

    socket.on("callback:accepted", async (payload) => {
      const parsed = callbackActionSchema.safeParse(payload);
      if (!parsed.success || auth.userId) return;
      const callback = await CallbackModel.findById(parsed.data.callbackId);
      if (!callback) return;
      callback.callbackStatus = "connected";
      if (!callback.callbackStartedAt) callback.callbackStartedAt = new Date();
      await callback.save();
      ioInstance?.to(`user:${callback.ownerId}`).emit("callback:accepted", {
        callbackId: String(callback._id),
        incidentId: String(callback.incidentId),
        callbackStatus: callback.callbackStatus,
        reporterSocketId: socket.id
      });
    });

    socket.on("callback:declined", async (payload) => {
      const parsed = callbackActionSchema.safeParse(payload);
      if (!parsed.success || auth.userId) return;
      const callback = await CallbackModel.findById(parsed.data.callbackId);
      if (!callback) return;
      callback.callbackStatus = "declined";
      callback.callbackEndedAt = new Date();
      callback.duration = callback.callbackStartedAt ? Math.floor((callback.callbackEndedAt.getTime() - callback.callbackStartedAt.getTime()) / 1000) : 0;
      await callback.save();
      ioInstance?.to(`user:${callback.ownerId}`).emit("callback:declined", {
        callbackId: String(callback._id),
        incidentId: String(callback.incidentId),
        callbackStatus: callback.callbackStatus
      });
    });

    socket.on("call_cancel", async (payload) => {
      const parsed = callActionSchema.safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      if (!isReporterSocket(socket.id, auth, call)) return;
      if (call.status !== "ringing") return;
      call.status = "cancelled";
      call.endedAt = new Date();
      call.agoraDisconnectedAt = call.endedAt;
      call.endReason = "reporter_ended";
      await call.save();
      if (getOnlineUserSockets(String(call.ownerUserId)).size > 0) {
        ioInstance?.to(`user:${call.ownerUserId}`).emit("call_cancelled", { callId: call.id });
      }
      socket.emit("call_cancelled", { callId: call.id });
    });

    socket.on("call_accept", async (payload) => {
      const parsed = callActionSchema.safeParse(payload);
      if (!parsed.success || !auth.userId) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      if (String(call.ownerUserId) !== auth.userId) return;
      if (!isCallActive(call.status)) return;
      call.status = "accepted";
      call.startedAt = new Date();
      if (!call.agoraJoinedAt) call.agoraJoinedAt = call.startedAt;
      call.ownerPlatform = parsed.data.platform || "web";
      ensureAgoraFields(call);
      await call.save();
      const incidentRoom = `incident:${String(call.incidentId)}`;
      const acceptedPayload = {
        callId: call.id,
        ownerSocketId: socket.id,
        reporterSocketId: call.reporterSessionId,
        agoraChannelName: call.agoraChannelName,
        agoraUidCaller: call.agoraUidCaller,
        agoraUidReceiver: call.agoraUidReceiver
      };
      ioInstance?.to(incidentRoom).emit("call:accepted", acceptedPayload);
      ioInstance?.to(incidentRoom).emit("call_accepted", acceptedPayload);
      ioInstance?.to(incidentRoom).emit("call_started", { callId: call.id });
      socket.emit("call_accepted", {
        callId: call.id,
        ownerSocketId: socket.id,
        reporterSocketId: call.reporterSessionId,
        agora: buildAgoraJoinPayload(call, "receiver"),
        agoraChannelName: call.agoraChannelName,
        agoraUidCaller: call.agoraUidCaller,
        agoraUidReceiver: call.agoraUidReceiver
      });
      socket.to(`user:${auth.userId}`).emit("call_cancelled", { callId: call.id });
      socket.emit("call_started", { callId: call.id });
    });

    socket.on("call_reject", async (payload) => {
      const parsed = z
        .object({
          callId: z.string().min(1),
          reason: z.string().max(250).optional()
        })
        .safeParse(payload);
      if (!parsed.success || !auth.userId) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      if (String(call.ownerUserId) !== auth.userId) return;
      call.status = "declined";
      call.endedAt = new Date();
      call.agoraDisconnectedAt = call.endedAt;
      call.rejectionReason = parsed.data.reason || "Owner rejected";
      call.endReason = "owner_ended";
      await call.save();
      ioInstance?.to(`incident:${String(call.incidentId)}`).emit("call:declined", { callId: call.id, reason: call.rejectionReason });
      ioInstance?.to(`incident:${String(call.incidentId)}`).emit("call_rejected", { callId: call.id, reason: call.rejectionReason });
    });

    socket.on("call_end", async (payload) => {
      const parsed = z
        .object({
          callId: z.string().min(1),
          targetSocketId: z.string().min(1).optional(),
          reason: z.string().max(100).optional()
        })
        .safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      const isOwner = !!auth.userId && String(call.ownerUserId) === auth.userId;
      call.status = "ended";
      call.endedAt = new Date();
      call.agoraDisconnectedAt = call.endedAt;
      call.duration = call.startedAt ? Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;
      call.endReason = parsed.data.reason || (isOwner ? "owner_ended" : "reporter_ended");
      await call.save();
      const explicitTarget = parsed.data.targetSocketId;
      const endPayload = { callId: call.id, duration: call.duration, reason: call.endReason };
      ioInstance?.to(`user:${call.ownerUserId}`).emit("call:ended", endPayload);
      ioInstance?.to(`incident:${String(call.incidentId)}`).emit("call:ended", endPayload);
      if (explicitTarget) {
        ioInstance?.to(explicitTarget).emit("call_ended", endPayload);
      } else {
        if (!isOwner && getOnlineUserSockets(String(call.ownerUserId)).size > 0) {
          ioInstance?.to(`user:${call.ownerUserId}`).emit("call_ended", endPayload);
        }
        if (isOwner) {
          ioInstance?.to(`incident:${String(call.incidentId)}`).emit("call_ended", endPayload);
        }
      }
      socket.emit("call_ended", endPayload);
    });

    socket.on("disconnect", () => {
      const disconnectedSocketId = socket.id;
      setTimeout(() => {
        void (async () => {
          try {
            // Give mobile/web clients time to reconnect and rebind reporterSessionId.
            // Without this grace period, short network hiccups end active calls.
            const openCalls = await CallSessionModel.find({
              reporterSessionId: disconnectedSocketId,
              status: { $in: ["ringing", "accepted", "active", "connected"] }
            });
            for (const call of openCalls) {
              const wasRinging = call.status === "ringing";
              if (wasRinging) {
                call.status = "missed";
                call.endReason = "disconnect";
              } else {
                call.status = "ended";
                call.endReason = "disconnect";
                if (call.startedAt) {
                  call.duration = Math.floor((Date.now() - call.startedAt.getTime()) / 1000);
                }
              }
              call.endedAt = new Date();
              call.agoraDisconnectedAt = call.endedAt;
              await call.save();
              const ownerUserId = String(call.ownerUserId);
              if (getOnlineUserSockets(ownerUserId).size > 0) {
                if (wasRinging) {
                  ioInstance?.to(`user:${ownerUserId}`).emit("call:missed", {
                    callId: call.id,
                    reason: "reporter_disconnected"
                  });
                  ioInstance?.to(`user:${ownerUserId}`).emit("call_missed", {
                    callId: call.id,
                    reason: "reporter_disconnected"
                  });
                } else {
                  ioInstance?.to(`user:${ownerUserId}`).emit("call:ended", {
                    callId: call.id,
                    duration: call.duration,
                    reason: call.endReason
                  });
                  ioInstance?.to(`user:${ownerUserId}`).emit("call_ended", {
                    callId: call.id,
                    duration: call.duration,
                    reason: call.endReason
                  });
                }
              }
              if (wasRinging) {
                try {
                  const { publishNotification } = await import("../infrastructure/notifications/realtime.notifications.js");
                  await publishNotification({
                    userId: ownerUserId,
                    type: "MISSED_CALL",
                    title: "Missed incident call",
                    body: "A caller hung up before you could answer.",
                    relatedEntityId: String(call.incidentId),
                    data: { callId: call.id, incidentId: String(call.incidentId), type: "MISSED_CALL" },
                    channelId: "calls"
                  });
                } catch (err) {
                  logger.warn("call.missed.push_failed", { err: (err as Error)?.message });
                }
              }
            }
          } catch (err) {
            logger.warn("call.disconnect.cleanup_failed", { err: (err as Error)?.message });
          }
        })();
      }, REPORTER_DISCONNECT_GRACE_MS);
      socketAuthById.delete(socket.id);
      if (auth.userId) {
        const isOffline = removeOnlineUserSocket(auth.userId, socket.id);
        if (isOffline) ioInstance?.emit("user_offline", { userId: auth.userId });
      }
    });
  });
  logger.info("socket_server_ready");
  return ioInstance;
};

export const emitIncidentCreated = async (userId: string, data: { incidentId: string; title: string; message: string }) => {
  // Persist + push via the realtime notifications helper so mobile devices receive a push when offline.
  try {
    const { publishNotification } = await import("../infrastructure/notifications/realtime.notifications.js");
    await publishNotification({
      userId,
      type: "INCIDENT_CREATED",
      title: data.title,
      body: data.message,
      relatedEntityId: data.incidentId,
      data: { incidentId: data.incidentId, type: "INCIDENT_CREATED" }
    });
  } catch (err) {
    logger.warn("incident.notification_failed", { err: (err as Error)?.message });
    try {
      await NotificationModel.create({
        userId,
        type: "incident_created",
        title: data.title,
        message: data.message,
        body: data.message,
        relatedEntityId: data.incidentId
      });
    } catch {
      /* ignore secondary failure */
    }
  }
  ioInstance?.to(`user:${userId}`).emit("incident:created", data);
  ioInstance?.to(`user:${userId}`).emit("incident_created", data);
};

export const emitToUser = (userId: string, event: string, payload: unknown) => {
  ioInstance?.to(`user:${userId}`).emit(event, payload);
};

export const emitToSocket = (socketId: string, event: string, payload: unknown) => {
  ioInstance?.to(socketId).emit(event, payload);
};

export const emitToIncidentRoom = (incidentId: string, event: string, payload: unknown) => {
  ioInstance?.to(`incident:${incidentId}`).emit(event, payload);
};

export const isUserOnline = (userId: string) => getOnlineUserSockets(userId).size > 0;

export const closeSocketServer = async () => {
  if (!ioInstance) return;
  await ioInstance.close();
  ioInstance = null;
  onlineUsers.clear();
  socketAuthById.clear();
};
