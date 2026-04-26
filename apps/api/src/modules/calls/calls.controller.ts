import type { Request, Response } from "express";
import { z } from "zod";
import { CallSessionModel } from "../../models/CallSession.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { emitToIncidentRoom, emitToUser } from "../../realtime/socket.js";

const callActionSchema = z.object({
  reason: z.string().max(200).optional(),
  platform: z.enum(["web", "android", "ios"]).optional()
});

const canAccept = (status: string) => status === "ringing" || status === "accepted" || status === "connected";
const canFinalizeIncoming = (status: string) => status === "ringing" || status === "accepted";

const loadOwnerCall = async (req: Request) => {
  const ownerUserId = req.auth?.userId;
  if (!ownerUserId) throw new ApiError(401, "Unauthorized");
  const callId = req.params.callId;
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
  call.status = "accepted";
  call.ownerPlatform = payload.platform ?? call.ownerPlatform ?? "web";
  if (!call.startedAt) call.startedAt = new Date();
  await call.save();

  const result = {
    callId: call.id,
    incidentId: String(call.incidentId),
    status: call.status,
    reporterSocketId: call.reporterSessionId || ""
  };

  if (wasRinging) {
    emitToIncidentRoom(String(call.incidentId), "call_accepted", {
      callId: call.id,
      ownerSocketId: "",
      reporterSocketId: call.reporterSessionId || ""
    });
    emitToIncidentRoom(String(call.incidentId), "call_started", { callId: call.id });
    emitToUser(String(call.ownerUserId), "call_cancelled", { callId: call.id });
  }

  res.json({ ok: true, call: result });
});

export const declineCall = asyncHandler(async (req: Request, res: Response) => {
  const call = await loadOwnerCall(req);
  const payload = callActionSchema.parse(req.body ?? {});
  if (!canFinalizeIncoming(call.status)) {
    return res.json({ ok: true, call: { callId: call.id, status: call.status } });
  }

  call.status = "declined";
  call.endedAt = new Date();
  call.endReason = payload.reason ?? "owner_rejected";
  call.rejectionReason = payload.reason ?? "Owner rejected";
  await call.save();

  emitToIncidentRoom(String(call.incidentId), "call_rejected", { callId: call.id, reason: call.rejectionReason });
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
  call.endReason = payload.reason ?? "timeout";
  await call.save();

  emitToIncidentRoom(String(call.incidentId), "call_missed", { callId: call.id, reason: call.endReason });
  emitToUser(String(call.ownerUserId), "call_missed", { callId: call.id, reason: call.endReason });

  res.json({ ok: true, call: { callId: call.id, status: call.status, reason: call.endReason } });
});
