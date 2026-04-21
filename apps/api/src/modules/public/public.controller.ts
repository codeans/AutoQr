import type { Request, Response } from "express";
import { QRCodeModel } from "../../models/QRCode.js";
import { IncidentModel } from "../../models/Incident.js";
import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { emitIncidentCreated } from "../../realtime/socket.js";
import { z } from "zod";
import { toPublicUploadPath } from "../../utils/uploads.js";

const incidentSchema = z.object({
  reporterName: z.string().optional().default(""),
  reporterPhone: z.string().min(7),
  message: z.string().min(5),
  consent: z.boolean().refine((v) => v, "Consent is required")
});

export const qrInfo = asyncHandler(async (req: Request, res: Response) => {
  const qr = await QRCodeModel.findOne({ qrUrlToken: req.params.token, status: { $ne: "disabled" } }).populate("vehicleOrItemId");
  if (!qr) throw new ApiError(404, "QR not found");
  res.json({
    qr: {
      status: qr.status,
      vehicleType: (qr.vehicleOrItemId as any)?.type ?? "registered item"
    }
  });
});

export const createIncident = asyncHandler(async (req: Request, res: Response) => {
  const payload = incidentSchema.parse({
    reporterName: req.body.reporterName,
    reporterPhone: req.body.reporterPhone,
    message: req.body.message,
    consent: req.body.consent === "true" || req.body.consent === true
  });
  const qr = await QRCodeModel.findOne({ qrUrlToken: req.params.token, status: { $ne: "disabled" } });
  if (!qr) throw new ApiError(404, "QR token invalid");
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  const incident = await IncidentModel.create({
    qrCodeId: qr.id,
    vehicleOrItemId: qr.vehicleOrItemId,
    userId: qr.userId,
    reporterName: payload.reporterName,
    reporterPhone: payload.reporterPhone,
    message: payload.message,
    images: files.map((file) => toPublicUploadPath(file.path))
  });

  await emitIncidentCreated(String(qr.userId), {
    incidentId: incident.id,
    title: "New incident reported",
    message: "A reporter submitted a new incident."
  });

  res.status(201).json({
    incident: {
      id: incident.id,
      status: incident.status,
      reporterPhone: incident.reporterPhone,
      ownerUserId: String(qr.userId)
    }
  });
});
