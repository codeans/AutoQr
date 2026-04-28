import type { Request } from "express";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { IncidentModel } from "../../models/Incident.js";
import { CallSessionModel } from "../../models/CallSession.js";
import { ApiError } from "../../utils/apiError.js";
import {
  agoraChannelForCall,
  agoraUidFor,
  generateAgoraRtcToken,
  type AgoraRole
} from "../../utils/agoraTokenGenerator.js";

export const ensureAgoraFields = (call: any) => {
  if (!call.agoraChannelName) call.agoraChannelName = agoraChannelForCall(call.id);
  if (!call.agoraUidCaller) call.agoraUidCaller = agoraUidFor(call.id, "caller");
  if (!call.agoraUidReceiver) call.agoraUidReceiver = agoraUidFor(call.id, "receiver");
  return call;
};

export const buildAgoraJoinPayload = (call: any, participant: "caller" | "receiver", role: AgoraRole = "publisher") => {
  ensureAgoraFields(call);
  const uid = participant === "caller" ? call.agoraUidCaller : call.agoraUidReceiver;
  return generateAgoraRtcToken({
    callId: call.id,
    channelName: call.agoraChannelName,
    uid,
    role
  });
};

export const authorizeAgoraTokenRequest = async (
  req: Request,
  callId: string,
  requestedUid?: number
): Promise<{ call: any; participant: "caller" | "receiver" }> => {
  const call = await CallSessionModel.findById(callId);
  if (!call) throw new ApiError(404, "Call not found");
  ensureAgoraFields(call);

  const bearer = req.headers.authorization?.replace("Bearer ", "");
  if (bearer) {
    try {
      const decoded = jwt.verify(bearer, env.JWT_ACCESS_SECRET) as { userId?: string; role?: string };
      if (decoded.userId && String(call.ownerUserId) === decoded.userId && decoded.role === "owner") {
        if (requestedUid && requestedUid !== call.agoraUidReceiver) throw new ApiError(403, "Invalid Agora uid for receiver");
        return { call, participant: "receiver" };
      }
    } catch {
      throw new ApiError(401, "Unauthorized");
    }
  }

  const reporterSessionToken = typeof req.body?.reporterSessionToken === "string" ? req.body.reporterSessionToken : "";
  if (reporterSessionToken) {
    const incident = await IncidentModel.findOne({ _id: call.incidentId, reporterSessionToken }).select("_id");
    if (incident) {
      if (requestedUid && requestedUid !== call.agoraUidCaller) throw new ApiError(403, "Invalid Agora uid for caller");
      return { call, participant: "caller" };
    }
  }

  throw new ApiError(401, "Unauthorized");
};
