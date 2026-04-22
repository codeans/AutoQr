import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { getMetricsSummary, listRecentEvents, trackEvent } from "./analytics.service.js";

const trackSchema = z.object({
  type: z.string().min(2).max(64),
  entityId: z.string().optional(),
  properties: z.record(z.string(), z.any()).optional(),
  sessionId: z.string().optional()
});

export const postTrack = asyncHandler(async (req: Request, res: Response) => {
  const body = trackSchema.parse(req.body);
  await trackEvent({
    ...body,
    userId: req.auth?.userId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  });
  res.status(202).json({ ok: true });
});

export const adminSummary = asyncHandler(async (_req: Request, res: Response) => {
  const data = await getMetricsSummary();
  res.json({ metrics: data });
});

export const adminRecent = asyncHandler(async (_req: Request, res: Response) => {
  const events = await listRecentEvents(200);
  res.json({ events });
});
