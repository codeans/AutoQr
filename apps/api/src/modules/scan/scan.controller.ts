import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { AnalyticsEventModel } from "../../models/AnalyticsEvent.js";
import {
  requestMaskedCall,
  resolveLandingByToken,
  submitScanAlert
} from "./scan.service.js";
import { ScanEventModel } from "../../models/ScanEvent.js";
import { maskGermanPhone } from "@autoqr/shared";

const sanitizeScan = (scan: any) => {
  const doc = { ...scan };
  if (doc.reporterPhone) doc.reporterPhone = maskGermanPhone(doc.reporterPhone);
  delete doc.reporterName;
  delete doc.ipAddress;
  delete doc.userAgent;
  return doc;
};

const alertSchema = z.object({
  reason: z.enum([
    "wrong_parking",
    "headlights_on",
    "flat_tyre",
    "towing",
    "door_or_window_open",
    "car_damaged",
    "accident",
    "other"
  ]),
  message: z.string().max(1000).optional(),
  reporterName: z.string().max(120).optional(),
  reporterPhone: z.string().max(40).optional(),
  consent: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .refine((v) => v === true, "Consent is required"),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      address: z.string().optional()
    })
    .optional()
});

const callSchema = z.object({
  reporterPhone: z.string().min(6).max(32),
  reporterName: z.string().max(120).optional(),
  reason: z.string().optional()
});

export const getLanding = asyncHandler(async (req: Request, res: Response) => {
  const data = await resolveLandingByToken(String(req.params.token));
  await AnalyticsEventModel.create({
    type: "scan_landing",
    properties: { token: String(req.params.token) },
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  }).catch(() => undefined);
  res.json(data);
});

export const postAlert = asyncHandler(async (req: Request, res: Response) => {
  const body = alertSchema.parse(req.body);
  const result = await submitScanAlert({
    publicToken: String(req.params.token),
    reason: body.reason,
    message: body.message,
    reporterName: body.reporterName,
    reporterPhone: body.reporterPhone,
    location: body.location,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  });
  res.status(201).json(result);
});

export const postCall = asyncHandler(async (req: Request, res: Response) => {
  const body = callSchema.parse(req.body);
  const result = await requestMaskedCall({
    publicToken: String(req.params.token),
    reporterPhone: body.reporterPhone,
    reporterName: body.reporterName,
    reason: body.reason
  });
  res.json(result);
});

export const ownerAlertsFeed = asyncHandler(async (req: Request, res: Response) => {
  const scans = await ScanEventModel.find({ ownerUserId: req.auth!.userId })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  res.json({ scans: scans.map(sanitizeScan) });
});

export const ownerAcknowledge = asyncHandler(async (req: Request, res: Response) => {
  const scan = await ScanEventModel.findOneAndUpdate(
    { _id: String(req.params.id), ownerUserId: req.auth!.userId },
    { $set: { status: "acknowledged", acknowledgedAt: new Date() } },
    { new: true }
  ).lean();
  res.json({ scan: scan ? sanitizeScan(scan) : null });
});
