import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { CURRENT_POLICY_VERSIONS, listAllConsent, listConsentForUser, recordConsent } from "./consent.service.js";

const recordSchema = z.object({
  type: z.enum(["terms", "privacy", "marketing", "data_sharing"]),
  accepted: z.boolean().default(true),
  sessionId: z.string().optional()
});

export const getPolicies = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ versions: CURRENT_POLICY_VERSIONS });
});

export const postRecord = asyncHandler(async (req: Request, res: Response) => {
  const body = recordSchema.parse(req.body);
  const record = await recordConsent({
    type: body.type,
    accepted: body.accepted,
    userId: req.auth?.userId,
    sessionId: body.sessionId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  });
  res.status(201).json({ record });
});

export const listMyConsent = asyncHandler(async (req: Request, res: Response) => {
  const records = await listConsentForUser(req.auth!.userId);
  res.json({ records });
});

export const adminListConsent = asyncHandler(async (_req: Request, res: Response) => {
  const records = await listAllConsent();
  res.json({ records });
});
