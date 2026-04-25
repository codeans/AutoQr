import type { Request, Response } from "express";
import { z } from "zod";
import { CallbackModel } from "../../models/Callback.js";
import { CallSessionModel } from "../../models/CallSession.js";
import { IncidentModel } from "../../models/Incident.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { emitToIncidentRoom, emitToUser } from "../../realtime/socket.js";
import { maskGermanPhone } from "@autoqr/shared";

const requestSchema = z.object({
  incidentId: z.string().min(1),
  notes: z.string().max(500).optional()
});

const startSchema = z.object({
  callbackId: z.string().min(1)
});

const endSchema = z.object({
  callbackId: z.string().min(1),
  callbackStatus: z.enum(["completed", "declined", "missed", "failed"]).default("completed"),
  notes: z.string().max(500).optional()
});

const sanitizeCallback = (doc: any) => ({
  ...(typeof doc?.toObject === "function" ? doc.toObject() : doc),
  reporterPhoneMasked: doc?.reporterPhone ? maskGermanPhone(doc.reporterPhone) : ""
});

export const requestCallback = asyncHandler(async (req: Request, res: Response) => {
  const payload = requestSchema.parse(req.body);
  const ownerId = req.auth!.userId;
  const incident = await IncidentModel.findOne({ _id: payload.incidentId, userId: ownerId }).select("carId reporterPhone");
  if (!incident) throw new ApiError(404, "Incident not found");
  if (!incident.reporterPhone) throw new ApiError(400, "Reporter phone is unavailable for callback");

  const callback = await CallbackModel.create({
    incidentId: incident._id,
    vehicleId: incident.carId ?? undefined,
    ownerId,
    reporterPhone: incident.reporterPhone,
    callbackStatus: "pending",
    notes: payload.notes ?? ""
  });

  emitToUser(ownerId, "callback:requested", {
    callbackId: String(callback._id),
    incidentId: String(incident._id),
    callbackStatus: callback.callbackStatus
  });
  res.status(201).json({ callback: sanitizeCallback(callback) });
});

export const startCallback = asyncHandler(async (req: Request, res: Response) => {
  const payload = startSchema.parse(req.body);
  const ownerId = req.auth!.userId;
  const callback = await CallbackModel.findOne({ _id: payload.callbackId, ownerId });
  if (!callback) throw new ApiError(404, "Callback not found");
  if (callback.callbackStatus === "completed") throw new ApiError(400, "Callback is already completed");

  const incident = await IncidentModel.findById(callback.incidentId).select("carId message images reporterName");
  if (!incident) throw new ApiError(404, "Incident not found");

  const lastCall = await CallSessionModel.findOne({ incidentId: callback.incidentId }).sort({ createdAt: -1 });
  const call = await CallSessionModel.create({
    incidentId: callback.incidentId,
    ownerUserId: callback.ownerId,
    reporterSessionId: lastCall?.reporterSessionId || `callback:${callback.id}`,
    reporterPhone: callback.reporterPhone,
    status: "ringing",
    reporterPlatform: lastCall?.reporterPlatform || "web",
    ownerPlatform: lastCall?.ownerPlatform || "web"
  });

  callback.callbackStatus = "calling";
  callback.callbackStartedAt = new Date();
  callback.callSessionId = call._id;
  await callback.save();

  const incomingPayload = {
    callbackId: String(callback._id),
    callId: String(call._id),
    incidentId: String(callback.incidentId),
    vehicleId: incident.carId ? String(incident.carId) : "",
    ownerId,
    reporterPhoneMasked: maskGermanPhone(callback.reporterPhone),
    callbackStatus: callback.callbackStatus,
    message: incident.message || "",
    incidentImages: incident.images || [],
    createdAt: callback.createdAt
  };

  emitToUser(ownerId, "callback:incoming", incomingPayload);
  emitToIncidentRoom(String(callback.incidentId), "callback:incoming", incomingPayload);

  try {
    const { publishNotification } = await import("../../infrastructure/notifications/realtime.notifications.js");
    await publishNotification({
      userId: ownerId,
      type: "CALL_ENDED",
      title: "Callback started",
      body: `Calling ${maskGermanPhone(callback.reporterPhone)}`,
      relatedEntityId: String(callback.incidentId),
      data: { callbackId: String(callback._id), incidentId: String(callback.incidentId), type: "CALL_ENDED" },
      channelId: "calls"
    });
  } catch {
    // best effort notification only
  }

  res.json({ callback: sanitizeCallback(callback), callId: String(call._id) });
});

export const endCallback = asyncHandler(async (req: Request, res: Response) => {
  const payload = endSchema.parse(req.body);
  const ownerId = req.auth!.userId;
  const callback = await CallbackModel.findOne({ _id: payload.callbackId, ownerId });
  if (!callback) throw new ApiError(404, "Callback not found");

  callback.callbackStatus = payload.callbackStatus;
  callback.callbackEndedAt = new Date();
  callback.duration = callback.callbackStartedAt ? Math.floor((callback.callbackEndedAt.getTime() - callback.callbackStartedAt.getTime()) / 1000) : 0;
  if (payload.notes !== undefined) callback.notes = payload.notes;
  await callback.save();

  if (callback.callSessionId) {
    const call = await CallSessionModel.findById(callback.callSessionId);
    if (call && call.status !== "ended") {
      call.status = payload.callbackStatus === "completed" ? "ended" : payload.callbackStatus === "declined" ? "declined" : payload.callbackStatus;
      call.endedAt = new Date();
      call.duration = callback.duration;
      call.endReason = `callback_${payload.callbackStatus}`;
      await call.save();
    }
  }

  const endedPayload = {
    callbackId: String(callback._id),
    incidentId: String(callback.incidentId),
    callbackStatus: callback.callbackStatus,
    duration: callback.duration
  };
  emitToUser(ownerId, "callback:ended", endedPayload);
  emitToIncidentRoom(String(callback.incidentId), "callback:ended", endedPayload);

  res.json({ callback: sanitizeCallback(callback) });
});

export const callbackHistory = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.auth!.userId;
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const query: Record<string, unknown> = { ownerId };
  if (status) query.callbackStatus = status;
  const callbacks = await CallbackModel.find(query)
    .populate("incidentId", "_id message status createdAt")
    .populate("vehicleId", "_id registrationNumber make model nickname")
    .sort({ createdAt: -1 });
  res.json({ callbacks: callbacks.map(sanitizeCallback) });
});

export const callbackDetail = asyncHandler(async (req: Request, res: Response) => {
  const callback = await CallbackModel.findOne({ _id: req.params.id, ownerId: req.auth!.userId })
    .populate("incidentId", "_id message status createdAt")
    .populate("vehicleId", "_id registrationNumber make model nickname");
  if (!callback) throw new ApiError(404, "Callback not found");
  res.json({ callback: sanitizeCallback(callback) });
});
