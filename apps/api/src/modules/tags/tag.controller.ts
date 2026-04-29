import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  activateTag,
  createTagBatch,
  disableTag,
  exportBatchRows,
  listActivationRecords,
  listBatches,
  listTags,
  listUserActivationHistory,
  listUserTags,
  markBatchStatus
} from "./tag.service.js";
import { AdminAuditLogModel } from "../../models/AdminAuditLog.js";
import { dispatchNotification } from "../../infrastructure/notifications/notification.service.js";
import { toPublicUploadPath } from "../../utils/uploads.js";

const batchSchema = z.object({
  label: z.string().min(2),
  quantity: z.number().int().min(1).max(2000),
  productId: z.string().optional(),
  notes: z.string().optional()
});

const activationSchema = z.object({
  assetType: z.enum(["car", "keys"]).default("car"),
  activationCode: z.string().min(4).max(40),
  carId: z.string().optional(),
  carPayload: z
    .object({
      registrationNumber: z.string().min(1),
      make: z.string().optional(),
      model: z.string().optional(),
      color: z.string().optional(),
      year: z.number().optional(),
      nickname: z.string().optional(),
      plateImage: z.string().optional()
    })
    .optional(),
  keyPayload: z
    .object({
      label: z.string().min(1),
      keyType: z.string().min(1),
      description: z.string().optional(),
      returnInstructions: z.string().optional(),
      image: z.string().optional()
    })
    .optional()
});

const csvEscape = (value: unknown) => {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

export const adminCreateBatch = asyncHandler(async (req: Request, res: Response) => {
  const body = batchSchema.parse(req.body);
  const batch = await createTagBatch({ ...body, adminId: req.auth!.userId });
  await AdminAuditLogModel.create({
    adminId: req.auth!.userId,
    action: "qr_batch_created",
    targetType: "tag_batch",
    targetId: batch.id,
    metadata: { label: batch.label, quantity: batch.quantity }
  });
  res.status(201).json({ batch });
});

export const adminListBatches = asyncHandler(async (_req: Request, res: Response) => {
  const batches = await listBatches();
  res.json({ batches });
});

export const adminUpdateBatchStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status } = z.object({ status: z.string() }).parse(req.body);
  const batch = await markBatchStatus(String(req.params.id), status);
  await AdminAuditLogModel.create({
    adminId: req.auth!.userId,
    action: "qr_batch_status_updated",
    targetType: "tag_batch",
    targetId: batch.id,
    metadata: { status }
  });
  res.json({ batch });
});

export const adminListTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await listTags({
    batchId: req.query.batchId as string | undefined,
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined
  });
  res.json({ tags });
});

export const adminDisableTag = asyncHandler(async (req: Request, res: Response) => {
  const tag = await disableTag(String(req.params.id));
  await AdminAuditLogModel.create({
    adminId: req.auth!.userId,
    action: "qr_disabled",
    targetType: "tag",
    targetId: tag.id,
    metadata: {}
  });
  res.json({ tag });
});

export const adminExportBatch = asyncHandler(async (req: Request, res: Response) => {
  const format = (req.query.format as string) ?? "csv";
  const { batch, tags } = await exportBatchRows(String(req.params.id));

  await AdminAuditLogModel.create({
    adminId: req.auth!.userId,
    action: "qr_batch_exported",
    targetType: "tag_batch",
    targetId: batch._id!.toString(),
    metadata: { format, count: tags.length }
  });

  if (format === "json") {
    res.json({ batch, tags });
    return;
  }

  const header = [
    "serial",
    "public_token",
    "activation_code",
    "public_url",
    "status",
    "qr_image"
  ].join(",");
  const rows = tags.map((t) =>
    [t.serial, t.publicToken, t.activationCode, t.publicUrl, t.status, t.qrImage]
      .map(csvEscape)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${batch.batchCode}-activation-codes.csv"`
  );
  res.send(csv);
});

export const adminListActivationRecords = asyncHandler(async (req: Request, res: Response) => {
  const records = await listActivationRecords({
    search: req.query.search as string | undefined,
    outcome: req.query.outcome as string | undefined
  });
  res.json({ records });
});

export const ownerActivateTag = asyncHandler(async (req: Request, res: Response) => {
  const body = activationSchema.parse(req.body);
  try {
    const result = await activateTag({
      ...body,
      userId: req.auth!.userId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? ""
    });
    const assetType = body.assetType ?? "car";
    await dispatchNotification({
      userId: req.auth!.userId,
      type: "activation_success",
      title: assetType === "keys" ? "Keys QR activated" : "Car QR activated",
      message:
        assetType === "keys"
          ? `Your QR ${result.tag.serial} is now active and linked to your keys.`
          : `Your QR ${result.tag.serial} is now active and linked to your car.`,
      channels: ["in_app", "email", "sms"]
    }).catch(() => undefined);
    res.status(201).json({ tag: result.tag, carId: result.carId, keyId: (result as any).keyId });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw err;
  }
});

export const ownerListTags = asyncHandler(async (req: Request, res: Response) => {
  const tags = await listUserTags(req.auth!.userId);
  res.json({ tags });
});

export const ownerActivationHistory = asyncHandler(async (req: Request, res: Response) => {
  const records = await listUserActivationHistory(req.auth!.userId);
  res.json({ records });
});

export const ownerActivateWithUpload = asyncHandler(async (req: Request, res: Response) => {
  const file = (req.file as Express.Multer.File | undefined) ?? undefined;

  const body: Record<string, unknown> = { ...req.body };
  if (typeof body.carPayload === "string") {
    try {
      body.carPayload = JSON.parse(body.carPayload as string);
    } catch {
      throw new ApiError(400, "Invalid car payload");
    }
  }
  if (file && body.carPayload && typeof body.carPayload === "object") {
    (body.carPayload as Record<string, unknown>).plateImage = toPublicUploadPath(file.path);
  }

  const parsed = activationSchema.parse(body);
  const result = await activateTag({
    ...parsed,
    userId: req.auth!.userId,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  });
  const assetType = parsed.assetType ?? "car";
  await dispatchNotification({
    userId: req.auth!.userId,
    type: "activation_success",
    title: assetType === "keys" ? "Keys QR activated" : "Car QR activated",
    message:
      assetType === "keys"
        ? `Your QR ${result.tag.serial} is now active and linked to your keys.`
        : `Your QR ${result.tag.serial} is now active and linked to your car.`,
    channels: ["in_app", "email", "sms"]
  }).catch(() => undefined);
  res.status(201).json({ tag: result.tag, carId: result.carId, keyId: (result as any).keyId });
});
