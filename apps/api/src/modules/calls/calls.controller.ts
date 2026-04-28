import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { CallSessionModel } from "../../models/CallSession.js";
import { IncidentModel } from "../../models/Incident.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { emitToIncidentRoom, emitToUser, emitToUserExcept, getPreferredUserSocketId } from "../../realtime/socket.js";
import { buildAgoraJoinPayload, ensureAgoraFields, authorizeAgoraTokenRequest } from "../../services/agora/agora.service.js";
import { env } from "../../config/env.js";

const callActionSchema = z.object({
  reason: z.string().max(200).optional(),
  platform: z.enum(["web", "android", "ios"]).optional(),
  ownerSocketId: z.string().min(1).optional()
});

const startCallSchema = z.object({
  ownerUserId: z.string().min(1),
  incidentId: z.string().min(1),
  reporterSessionToken: z.string().min(1),
  platform: z.enum(["web", "android", "ios"]).optional().default("web")
});

const tokenSchema = z.object({
  callId: z.string().min(1),
  channelName: z.string().min(1).optional(),
  role: z.enum(["publisher", "subscriber"]).optional().default("publisher"),
  uid: z.coerce.number().int().positive().optional(),
  reporterSessionToken: z.string().optional()
});

const endCallSchema = z.object({
  callId: z.string().min(1),
  reason: z.string().max(100).optional()
});

const canAccept = (status: string) => status === "ringing" || status === "accepted" || status === "active" || status === "connected";
const canFinalizeIncoming = (status: string) => status === "ringing" || status === "accepted";

const loadOwnerCall = async (req: Request) => {
  const ownerUserId = req.auth?.userId;
  if (!ownerUserId) throw new ApiError(401, "Unauthorized");
  const callId = req.params.callId || req.body?.callId;
  if (!callId) throw new ApiError(400, "Missing callId");
  const call = await CallSessionModel.findOne({ _id: callId, ownerUserId });
  if (!call) throw new ApiError(404, "Call not found");
  return call;
};

export const acceptCall = asyncHandler(async (req: Request, res: Response) => {
  const call = await loadOwnerCall(req);
  const payload = callActionSchema.parse(req.body ?? {});
  if (!canAccept(call.status)) {
    throw new ApiError(409, "Call is no longer available");
  }

  const wasRinging = call.status === "ringing";
  const ownerSocketId = getPreferredUserSocketId(String(call.ownerUserId), payload.ownerSocketId);
  ensureAgoraFields(call);
  call.status = "accepted";
  call.ownerPlatform = payload.platform ?? call.ownerPlatform ?? "web";
  if (!call.startedAt) call.startedAt = new Date();
  if (!call.agoraJoinedAt) call.agoraJoinedAt = new Date();
  await call.save();
  const receiverAgora = buildAgoraJoinPayload(call, "receiver");

  const result = {
    callId: call.id,
    incidentId: String(call.incidentId),
    status: call.status,
    ownerSocketId,
    reporterSocketId: call.reporterSessionId || "",
    agora: receiverAgora
  };

  if (wasRinging) {
    const acceptedPayload = {
      callId: call.id,
      ownerSocketId,
      reporterSocketId: call.reporterSessionId || "",
      agoraChannelName: call.agoraChannelName,
      agoraUidCaller: call.agoraUidCaller,
      agoraUidReceiver: call.agoraUidReceiver
    };
    emitToIncidentRoom(String(call.incidentId), "call:accepted", acceptedPayload);
    emitToIncidentRoom(String(call.incidentId), "call_accepted", acceptedPayload);
    emitToIncidentRoom(String(call.incidentId), "call_started", { callId: call.id });
    if (ownerSocketId) {
      emitToUserExcept(String(call.ownerUserId), ownerSocketId, "call_cancelled", { callId: call.id });
    }
  }

  res.json({ ok: true, call: result });
});

export const issueAgoraToken = asyncHandler(async (req: Request, res: Response) => {
  const payload = tokenSchema.parse(req.body ?? {});
  const { call, participant } = await authorizeAgoraTokenRequest(req, payload.callId, payload.uid);
  ensureAgoraFields(call);
  const channelName = payload.channelName ?? call.agoraChannelName;
  if (channelName !== call.agoraChannelName) throw new ApiError(400, "Invalid Agora channel");
  const agora = buildAgoraJoinPayload(call, participant, payload.role);
  if (call.isModified?.()) await call.save();
  res.json({ ok: true, agora });
});

export const startCall = asyncHandler(async (req: Request, res: Response) => {
  const payload = startCallSchema.parse(req.body ?? {});
  const incident = await IncidentModel.findOne({
    _id: payload.incidentId,
    userId: payload.ownerUserId,
    reporterSessionToken: payload.reporterSessionToken
  }).select("_id userId reporterPhone");
  if (!incident) throw new ApiError(404, "Incident not found");

  const call = await CallSessionModel.findOneAndUpdate(
    {
      incidentId: payload.incidentId,
      ownerUserId: payload.ownerUserId,
      status: { $in: ["ringing", "accepted", "active", "connected"] }
    },
    {
      $setOnInsert: {
        reporterSessionId: "",
        reporterPhone: incident.reporterPhone || "",
        status: "ringing",
        pushStatus: "pending"
      },
      $set: {
        reporterPlatform: payload.platform
      }
    },
    { new: true, upsert: true, setDefaultsOnInsert: true, sort: { createdAt: -1 } }
  );
  ensureAgoraFields(call);
  await call.save();

  const agora = buildAgoraJoinPayload(call, "caller");
  emitToUser(String(call.ownerUserId), "call:incoming", {
    callId: call.id,
    incidentId: String(call.incidentId),
    ownerId: String(call.ownerUserId),
    status: call.status,
    reporterSocketId: call.reporterSessionId || "",
    reporterPhone: call.reporterPhone || "",
    platform: call.reporterPlatform || "web",
    agoraChannelName: call.agoraChannelName,
    agoraUidCaller: call.agoraUidCaller,
    agoraUidReceiver: call.agoraUidReceiver
  });

  res.status(201).json({
    ok: true,
    call: {
      callId: call.id,
      incidentId: String(call.incidentId),
      status: call.status,
      agora
    }
  });
});

export const declineCall = asyncHandler(async (req: Request, res: Response) => {
  const call = await loadOwnerCall(req);
  const payload = callActionSchema.parse(req.body ?? {});
  if (!canFinalizeIncoming(call.status)) {
    return res.json({ ok: true, call: { callId: call.id, status: call.status } });
  }

  call.status = "declined";
  call.endedAt = new Date();
  call.agoraDisconnectedAt = call.endedAt;
  call.endReason = payload.reason ?? "owner_rejected";
  call.rejectionReason = payload.reason ?? "Owner rejected";
  await call.save();

  emitToIncidentRoom(String(call.incidentId), "call:declined", { callId: call.id, reason: call.rejectionReason });
  emitToIncidentRoom(String(call.incidentId), "call_rejected", { callId: call.id, reason: call.rejectionReason });
  emitToUser(String(call.ownerUserId), "call:declined", { callId: call.id, reason: call.rejectionReason });
  emitToUser(String(call.ownerUserId), "call_ended", {
    callId: call.id,
    duration: 0,
    reason: call.endReason
  });

  res.json({ ok: true, call: { callId: call.id, status: call.status, reason: call.endReason } });
});

export const markCallMissed = asyncHandler(async (req: Request, res: Response) => {
  const call = await loadOwnerCall(req);
  const payload = callActionSchema.parse(req.body ?? {});
  if (!canFinalizeIncoming(call.status)) {
    return res.json({ ok: true, call: { callId: call.id, status: call.status } });
  }

  call.status = "missed";
  call.endedAt = new Date();
  call.agoraDisconnectedAt = call.endedAt;
  call.endReason = payload.reason ?? "timeout";
  await call.save();

  emitToIncidentRoom(String(call.incidentId), "call:missed", { callId: call.id, reason: call.endReason });
  emitToIncidentRoom(String(call.incidentId), "call_missed", { callId: call.id, reason: call.endReason });
  emitToUser(String(call.ownerUserId), "call:missed", { callId: call.id, reason: call.endReason });
  emitToUser(String(call.ownerUserId), "call_missed", { callId: call.id, reason: call.endReason });

  res.json({ ok: true, call: { callId: call.id, status: call.status, reason: call.endReason } });
});

export const endCall = asyncHandler(async (req: Request, res: Response) => {
  const payload = endCallSchema.parse({ ...(req.body ?? {}), callId: req.body?.callId ?? req.params.callId });
  const call = await CallSessionModel.findById(payload.callId);
  if (!call) throw new ApiError(404, "Call not found");
  let auth = req.auth;
  const bearer = req.headers.authorization?.replace("Bearer ", "");
  if (!auth && bearer) {
    try {
      auth = jwt.verify(bearer, env.JWT_ACCESS_SECRET) as typeof req.auth;
    } catch {
      throw new ApiError(401, "Unauthorized");
    }
  }
  const isOwner = auth?.userId && String(call.ownerUserId) === auth.userId;
  const reporterSessionToken = typeof req.body?.reporterSessionToken === "string" ? req.body.reporterSessionToken : "";
  const isReporter = reporterSessionToken
    ? !!(await IncidentModel.findOne({ _id: call.incidentId, reporterSessionToken }).select("_id"))
    : false;
  if (!isOwner && !isReporter) throw new ApiError(401, "Unauthorized");

  call.status = "ended";
  call.endedAt = new Date();
  call.agoraDisconnectedAt = call.endedAt;
  call.duration = call.startedAt ? Math.floor((call.endedAt.getTime() - call.startedAt.getTime()) / 1000) : 0;
  call.endReason = payload.reason || (isOwner ? "owner_ended" : "reporter_ended");
  await call.save();

  const endPayload = { callId: call.id, duration: call.duration, reason: call.endReason };
  emitToUser(String(call.ownerUserId), "call:ended", endPayload);
  emitToUser(String(call.ownerUserId), "call_ended", endPayload);
  emitToIncidentRoom(String(call.incidentId), "call:ended", endPayload);
  emitToIncidentRoom(String(call.incidentId), "call_ended", endPayload);
  res.json({ ok: true, call: { ...endPayload, status: call.status } });
});
