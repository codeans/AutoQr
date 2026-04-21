import { Server } from "socket.io";
import type { Server as HttpServer } from "node:http";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/env.js";
import { CallSessionModel } from "../models/CallSession.js";
import { IncidentModel } from "../models/Incident.js";
import { NotificationModel } from "../models/Notification.js";
import { logger } from "../utils/logger.js";

type SocketAuth = { userId?: string; role?: "owner" | "admin"; incidentId?: string; reporterSessionId?: string };

const onlineUsers = new Map<string, string>();
const socketAuthById = new Map<string, SocketAuth>();

let ioInstance: Server | null = null;

const callRequestedSchema = z.object({
  ownerUserId: z.string().min(1),
  incidentId: z.string().min(1)
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
    try {
      if (token) {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as SocketAuth;
        socket.data.auth = decoded;
        socketAuthById.set(socket.id, decoded);
        return next();
      }
      if (incidentToken) {
        const incident = await IncidentModel.findById(incidentToken).select("_id userId");
        if (!incident) {
          return next(new Error("Unauthorized"));
        }
        socket.data.auth = { incidentId: String(incident.id), reporterSessionId: socket.id };
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
      onlineUsers.set(auth.userId, socket.id);
      socket.join(`user:${auth.userId}`);
      ioInstance?.to(`user:${auth.userId}`).emit("user_online", { userId: auth.userId });
    }
    if (auth.incidentId) socket.join(`incident:${auth.incidentId}`);

    socket.on("call_requested", async (payload) => {
      const parsed = callRequestedSchema.safeParse(payload);
      if (!parsed.success || auth.userId) {
        return;
      }
      const { ownerUserId, incidentId } = parsed.data;
      if (auth.incidentId !== incidentId) {
        return;
      }
      const incident = await IncidentModel.findById(incidentId).select("userId");
      if (!incident || String(incident.userId) !== ownerUserId) {
        return;
      }
      const call = await CallSessionModel.create({
        incidentId,
        ownerUserId,
        reporterSessionId: socket.id,
        status: "ringing"
      });
      socket.emit("call_requested", { callId: call.id, status: "ringing" });
      ioInstance?.to(`user:${ownerUserId}`).emit("call_ringing", { callId: call.id, incidentId, reporterSocketId: socket.id });
    });

    socket.on("call_accept", async (payload) => {
      const parsed = callActionSchema.safeParse(payload);
      if (!parsed.success || !auth.userId) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      if (String(call.ownerUserId) !== auth.userId) return;
      call.status = "connected";
      call.startedAt = new Date();
      await call.save();
      ioInstance?.to(call.reporterSessionId).emit("call_accepted", { callId: call.id, ownerSocketId: socket.id });
      ioInstance?.to(call.reporterSessionId).emit("call_started", { callId: call.id });
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
      await call.save();
      ioInstance?.to(call.reporterSessionId).emit("call_rejected", { callId: call.id, reason: call.rejectionReason });
    });

    socket.on("webrtc_offer", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ offer: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && parsed.data.targetSocketId !== onlineUsers.get(String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_offer", { offer: parsed.data.offer, callId: call.id, fromSocketId: socket.id });
    });

    socket.on("webrtc_answer", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ answer: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && parsed.data.targetSocketId !== onlineUsers.get(String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_answer", { answer: parsed.data.answer, callId: call.id });
    });

    socket.on("webrtc_ice_candidate", async (payload) => {
      const parsed = webrtcSignalSchema.extend({ candidate: z.unknown() }).safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call || call.status !== "connected") return;
      if (parsed.data.targetSocketId !== call.reporterSessionId && parsed.data.targetSocketId !== onlineUsers.get(String(call.ownerUserId))) return;
      ioInstance?.to(parsed.data.targetSocketId).emit("webrtc_ice_candidate", { candidate: parsed.data.candidate, callId: call.id });
    });

    socket.on("call_end", async (payload) => {
      const parsed = z
        .object({
          callId: z.string().min(1),
          targetSocketId: z.string().min(1).optional()
        })
        .safeParse(payload);
      if (!parsed.success) return;
      const call = await getCallForSocket(socket.id, parsed.data.callId);
      if (!call) return;
      const ownerSocketId = onlineUsers.get(String(call.ownerUserId));
      call.status = "ended";
      call.endedAt = new Date();
      call.duration = call.startedAt ? Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;
      await call.save();
      const explicitTarget = parsed.data.targetSocketId;
      if (explicitTarget) {
        ioInstance?.to(explicitTarget).emit("call_ended", { callId: call.id, duration: call.duration });
      } else {
        if (ownerSocketId && ownerSocketId !== socket.id) {
          ioInstance?.to(ownerSocketId).emit("call_ended", { callId: call.id, duration: call.duration });
        }
        if (call.reporterSessionId !== socket.id) {
          ioInstance?.to(call.reporterSessionId).emit("call_ended", { callId: call.id, duration: call.duration });
        }
      }
      socket.emit("call_ended", { callId: call.id, duration: call.duration });
    });

    socket.on("disconnect", () => {
      CallSessionModel.updateMany({ reporterSessionId: socket.id, status: "ringing" }, { $set: { status: "missed", endedAt: new Date() } }).catch(() => undefined);
      socketAuthById.delete(socket.id);
      if (auth.userId) {
        onlineUsers.delete(auth.userId);
        ioInstance?.emit("user_offline", { userId: auth.userId });
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

export const closeSocketServer = async () => {
  if (!ioInstance) return;
  await ioInstance.close();
  ioInstance = null;
  onlineUsers.clear();
  socketAuthById.clear();
};
