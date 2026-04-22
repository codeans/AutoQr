import type { Request, Response } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { TagModel } from "../../models/Tag.js";
import { CarModel } from "../../models/Car.js";
import { IncidentModel } from "../../models/Incident.js";
import { CallSessionModel } from "../../models/CallSession.js";
import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { emitIncidentCreated } from "../../realtime/socket.js";
import { toPublicUploadPath } from "../../utils/uploads.js";
import { toGermanE164 } from "@autoqr/shared";

const incidentSchema = z.object({
  reporterName: z.string().max(120).optional().default(""),
  reporterPhone: z.string().min(4).max(40),
  message: z.string().min(5).max(2000),
  consent: z.boolean().refine((v) => v, "Consent is required")
});

const formatCar = (car: any) => ({
  make: car?.make ?? "",
  model: car?.model ?? "",
  nickname: car?.nickname ?? "",
  color: car?.color ?? ""
});

export const qrInfo = asyncHandler(async (req: Request, res: Response) => {
  const tag = await TagModel.findOne({ publicToken: req.params.token });
  if (!tag) throw new ApiError(404, "QR not found");
  if (tag.status === "disabled" || tag.status === "lost") {
    throw new ApiError(410, "This QR is no longer active");
  }
  const car = tag.carId ? await CarModel.findById(tag.carId).lean() : null;
  res.json({
    qr: {
      status: tag.status,
      car: car ? formatCar(car) : null
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

  const normalizedPhone = toGermanE164(payload.reporterPhone);
  if (!normalizedPhone) {
    throw new ApiError(400, "Please enter a valid German phone number (e.g. +49 170 1234567).");
  }

  const tag = await TagModel.findOne({ publicToken: req.params.token });
  if (!tag) throw new ApiError(404, "QR token invalid");
  if (tag.status === "disabled" || tag.status === "lost") {
    throw new ApiError(410, "This QR is no longer active");
  }
  if (tag.status !== "activated" || !tag.carId || !tag.ownerUserId) {
    throw new ApiError(400, "This QR has not been linked to a car yet");
  }
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];

  const reporterSessionToken = crypto.randomBytes(24).toString("hex");

  const incident = await IncidentModel.create({
    tagId: tag.id,
    carId: tag.carId,
    userId: tag.ownerUserId,
    reporterName: payload.reporterName,
    reporterPhone: normalizedPhone,
    reporterPhoneRaw: payload.reporterPhone,
    reporterSessionToken,
    message: payload.message,
    images: files.map((file) => toPublicUploadPath(file.path)),
    callPlatform: "web",
    consentAt: new Date()
  });

  await emitIncidentCreated(String(tag.ownerUserId), {
    incidentId: incident.id,
    title: "New car incident reported",
    message: "A reporter submitted a new incident for your car."
  });

  res.status(201).json({
    incident: {
      id: incident.id,
      status: incident.status,
      reporterPhone: incident.reporterPhone,
      ownerUserId: String(tag.ownerUserId),
      reporterSessionToken,
      images: incident.images,
      imageCount: incident.images.length,
      createdAt: incident.createdAt
    }
  });
});

const reporterAuthSchema = z.object({
  sessionToken: z.string().min(16).max(128)
});

export const reporterIncidentView = asyncHandler(async (req: Request, res: Response) => {
  const { incidentId } = req.params;
  const { sessionToken } = reporterAuthSchema.parse({ sessionToken: req.query.sessionToken });
  const incident = await IncidentModel.findById(incidentId).populate("carId");
  if (!incident || incident.reporterSessionToken !== sessionToken) {
    throw new ApiError(404, "Incident not accessible");
  }
  const car = incident.carId as any;
  const latestCall = await CallSessionModel.findOne({ incidentId: incident.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({
    incident: {
      id: incident.id,
      ownerUserId: String(incident.userId),
      reporterPhone: incident.reporterPhone,
      message: incident.message,
      images: incident.images,
      createdAt: incident.createdAt,
      car: car ? formatCar(car) : null
    },
    latestCall: latestCall
      ? {
          id: String(latestCall._id),
          status: latestCall.status,
          duration: latestCall.duration,
          endReason: latestCall.endReason,
          createdAt: latestCall.createdAt
        }
      : null
  });
});
