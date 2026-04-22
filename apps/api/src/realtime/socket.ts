import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { CallSessionModel } from "../models/CallSession.js";
import { IncidentModel } from "../models/Incident.js";
import { NotificationModel } from "../models/Notification.js";
import { CarModel } from "../models/Car.js";
import { logger } from "../utils/logger.js";
import { maskGermanPhone } from "@autoqr/shared";

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

const callRequestedSchema = z.object({
  ownerUserId: z.string().min(1),
  incidentId: z.string().min(1),
  platform: z.enum(["web", "android", "ios"]).optional().default("web")
});

const callActionSchema = z.object({
  callId: z.string().min(1)
});

const webrtcSignalSchema = z.object({
  targetSocketId: z.string().min(1),
  callId: z.string().min(1)
});

const getCallForSocket = async (socketId: string, callId: string) => {
  const call = await CallSessionModel.findById(callId);
  if (!call) return null;
  const auth = socketAuthById.get(socketId);
  if (!auth) return null;
  const isOwner = !!auth.userId && String(call.ownerUserId) === auth.userId;
  const isReporter = call.reporterSessionId === socketId;
  if (!isOwner && !isReporter) return null;
  return call;
};

const isCallActive = (status: string) => ["ringing", "accepted", "connected"].includes(status);

const buildIncomingCallPayload = async (call: any, incidentId: string, reporterSocketId: string) => {
  const incident = await IncidentModel.findById(incidentId).lean();
  let carLabel = "";
  if (incident?.carId) {
    const car = await CarModel.findById(incident.carId).lean();
    if (car) {
      const nickname = car.nickname || "";
      const make = car.make || "";
      const model = car.model || "";
      carLabel = [nickname, [make, model].filter(Boolean).join(" ")].filter(Boolean).join(" · ") || make || model || "";
    }
  }
  const phone = incident?.reporterPhone || "";
  return {
    callId: String(call._id),
    incidentId,
    reporterSocketId,
    reporterPhoneMasked: phone ? maskGermanPhone(phone) : "",
    carId: incident?.carId ? String(incident.carId) : "",
    carLabel,
    imageCount: Array.isArray(incident?.images) ? incident?.images.length : 0,
    message: incident?.message || "",
    platform: call.reporterPlatform || "web",
    createdAt: call.createdAt
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
      ioInstance?.to(`user:${auth.userId}`).emit("user_online", { userId: auth.userId });
    }
    if (auth.incidentId) socket.join(`incident:${auth.incidentId}`);

    socket.on("call_requested", async (payload) => {
      const parsed = callRequestedSchema.safeParse(payload);
      if (!parsed.success || auth.userId) {
        return;
      }
      const { ownerUserId, incidentId, platform } = parsed.data;
      if (auth.incidentId !== incidentId) {
        return;
      }
      const incident = await IncidentModel.findById(incidentId).select("userId reporterPhone");
      if (!incident || String(incident.userId) !== ownerUserId) {
        return;
      }
      const call = await CallSessionModel.create({
        incidentId,
        ownerUserId,
        reporterSessionId: socket.id,
        reporterPhone: incident.reporterPhone || "",
        reporterPlatform: platform,
        status: "ringing"
      });
      const ownerOnline = getOnlineUserSockets(ownerUserId).size > 0;
      const ringingPayload = await buildIncomingCallPayload(call, incidentId, socket.id);
      socket.emit("call_requested", { callId: call.id, status: "ringing", ownerOnline });
      if (ownerOnline) {
        ioInstance?.to(`user:${ownerUserId}`).emit("call_ringing", ringingPayload);
      } else {
        // Owner offline — mark as missed immediately and notify reporter
        call.status = "missed";
        call.endedAt = new Date();
        call.endReason = "owner_offline";
        await call.save();
        try {
          await NotificationModel.create({
            userId: ownerUserId,
            type: "call_missed",
            title: "Missed incident call",
            message: `Missed call from ${maskGermanPhone(incident.reporterPhone || "")}`,
            relatedEntityId: incidentId
          });
        } catch (err) {
          logger.warn("call.offline.notification_failed", { err: (err as Error)?.message });
        }
        socket.emit("call_missed", { callId: call.id, reason: "owner_offline" });
      }
    });

    socket.on("call_cancel", async (payload) => {
      const parsed = callActionSchema.safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      if (call.reporterSessionId !== socket.id) return;
      if (call.status !== "ringing") return;
      call.status = "cancelled";
      call.endedAt = new Date();
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
      call.status = "connected";
      call.startedAt = new Date();
      call.ownerPlatform = "web";
      await call.save();
      ioInstance?.to(call.reporterSessionId).emit("call_accepted", { callId: call.id, ownerSocketId: socket.id });
      ioInstance?.to(call.reporterSessionId).emit("call_started", { callId: call.id });
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
      call.status = "rejected";
      call.endedAt = new Date();
      call.rejectionReason = parsed.data.reason || "Owner rejected";
      call.endReason = "owner_ended";
      await call.save();
      ioInstance?.to(call.reporterSessionId).emit("call_rejected", { callId: call.id, reason: call.rejectionReason });
    });

    socket.on("webrtc_offer", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ offer: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && !isSocketForCallOwner(parsed.data.targetSocketId, String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_offer", { offer: parsed.data.offer, callId: call.id, fromSocketId: socket.id });
    });

    socket.on("webrtc_answer", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ answer: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && !isSocketForCallOwner(parsed.data.targetSocketId, String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_answer", { answer: parsed.data.answer, callId: call.id });
    });

    socket.on("webrtc_ice_candidate", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ candidate: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && !isSocketForCallOwner(parsed.data.targetSocketId, String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_ice_candidate", { candidate: parsed.data.candidate, callId: call.id });
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
      call.duration = call.startedAt ? Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;
      call.endReason = parsed.data.reason || (isOwner ? "owner_ended" : "reporter_ended");
      await call.save();
      const explicitTarget = parsed.data.targetSocketId;
      const endPayload = { callId: call.id, duration: call.duration, reason: call.endReason };
      if (explicitTarget) {
        ioInstance?.to(explicitTarget).emit("call_ended", endPayload);
      } else {
        if (!isOwner && getOnlineUserSockets(String(call.ownerUserId)).size > 0) {
          ioInstance?.to(`user:${call.ownerUserId}`).emit("call_ended", endPayload);
        }
        if (call.reporterSessionId !== socket.id) {
          ioInstance?.to(call.reporterSessionId).emit("call_ended", endPayload);
        }
      }
      socket.emit("call_ended", endPayload);
    });

    socket.on("disconnect", async () => {
      try {
        const openCalls = await CallSessionModel.find({ reporterSessionId: socket.id, status: { $in: ["ringing", "accepted", "connected"] } });
        for (const call of openCalls) {
          if (call.status === "ringing") {
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
          await call.save();
          if (getOnlineUserSockets(String(call.ownerUserId)).size > 0) {
            ioInstance?.to(`user:${call.ownerUserId}`).emit("call_ended", { callId: call.id, duration: call.duration, reason: call.endReason });
          }
        }
      } catch (err) {
        logger.warn("call.disconnect.cleanup_failed", { err: (err as Error)?.message });
      }
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
  await NotificationModel.create({
    userId,
    type: "incident_created",
    title: data.title,
    message: data.message,
    relatedEntityId: data.incidentId
  });
  ioInstance?.to(`user:${userId}`).emit("incident_created", data);
};

export const isUserOnline = (userId: string) => getOnlineUserSockets(userId).size > 0;

export const closeSocketServer = async () => {
  if (!ioInstance) return;
  await ioInstance.close();
  ioInstance = null;
  onlineUsers.clear();
  socketAuthById.clear();
};
