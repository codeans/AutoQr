import crypto from "node:crypto";
import mongoose from "mongoose";
import { TagModel } from "../../models/Tag.js";
import { TagBatchModel } from "../../models/TagBatch.js";
import { CarModel } from "../../models/Car.js";
import { UserModel } from "../../models/User.js";
import { KeyModel } from "../../models/Key.js";
import {
  ActivationAttemptModel,
  ActivationRecordModel
} from "../../models/ActivationRecord.js";
import { ApiError } from "../../utils/apiError.js";
import { generateQrAsset } from "../../infrastructure/qr/qr.service.js";

const makeSerial = (prefix: string, index: number) =>
  `${prefix}-${String(index).padStart(6, "0")}`;
const randomActivationCode = () => crypto.randomBytes(4).toString("hex").toUpperCase();

const MAX_ATTEMPTS_PER_WINDOW = 10;
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

export const createTagBatch = async (args: {
  label: string;
  quantity: number;
  productId?: string;
  adminId?: string;
  notes?: string;
}) => {
  if (args.quantity <= 0) throw new ApiError(400, "Quantity must be > 0");
  if (args.quantity > 2000) throw new ApiError(400, "Max 2000 QRs per batch");
  const batchCode = `BATCH-${Date.now().toString(36).toUpperCase()}`;
  const batch = await TagBatchModel.create({
    batchCode,
    label: args.label,
    productId: args.productId,
    quantity: args.quantity,
    status: "generated",
    createdByAdminId: args.adminId,
    notes: args.notes ?? ""
  });
  const tags = [] as any[];
  for (let i = 1; i <= args.quantity; i += 1) {
    const qr = await generateQrAsset();
    tags.push({
      batchId: batch.id,
      serial: makeSerial(batchCode, i),
      publicToken: qr.qrUrlToken,
      activationCode: randomActivationCode(),
      qrImage: qr.qrImage,
      status: "generated"
    });
  }
  await TagModel.insertMany(tags);
  batch.generatedCount = args.quantity;
  await batch.save();
  return batch;
};

const buildBatchStats = async (batchIds: mongoose.Types.ObjectId[]) => {
  if (batchIds.length === 0) return new Map<string, Record<string, number>>();
  const rows = await TagModel.aggregate([
    { $match: { batchId: { $in: batchIds } } },
    { $group: { _id: { batchId: "$batchId", status: "$status" }, count: { $sum: 1 } } }
  ]);
  const map = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const key = String(row._id.batchId);
    const entry = map.get(key) ?? {};
    entry[row._id.status as string] = row.count;
    map.set(key, entry);
  }
  return map;
};

export const listBatches = async () => {
  const batches = await TagBatchModel.find({}).sort({ createdAt: -1 }).lean();
  const ids = batches.map((b) => b._id as mongoose.Types.ObjectId);
  const stats = await buildBatchStats(ids);
  return batches.map((b) => {
    const entry = stats.get(String(b._id)) ?? {};
    const generated = entry.generated ?? 0;
    const assigned =
      (entry.printed ?? 0) + (entry.dispatched ?? 0) + (entry.unlinked ?? 0);
    const activated = entry.activated ?? 0;
    const disabled = (entry.disabled ?? 0) + (entry.lost ?? 0);
    return {
      ...b,
      inStockCount: generated,
      assignedCount: assigned,
      activatedCount: activated,
      disabledCount: disabled
    };
  });
};

export const listTags = async (filters: {
  batchId?: string;
  status?: string;
  search?: string;
  limit?: number;
}) => {
  const query: any = {};
  if (filters.batchId) query.batchId = filters.batchId;
  if (filters.status) query.status = filters.status;
  if (filters.search) {
    const rx = new RegExp(filters.search, "i");
    query.$or = [
      { serial: rx },
      { publicToken: filters.search },
      { activationCode: filters.search.toUpperCase() }
    ];
  }
  return TagModel.find(query)
    .populate("ownerUserId", "name email phone")
    .populate("carId", "registrationNumber make model nickname")
    .populate("batchId", "batchCode label")
    .populate("orderId", "orderStatus paymentStatus")
    .sort({ createdAt: -1 })
    .limit(filters.limit ?? 500)
    .lean();
};

export const markBatchStatus = async (batchId: string, status: string) => {
  const updates: Record<string, unknown> = { status };
  if (status === "printed") updates.printedAt = new Date();
  const batch = await TagBatchModel.findByIdAndUpdate(batchId, updates, { new: true });
  if (!batch) throw new ApiError(404, "Batch not found");
  if (status === "printed") {
    batch.printedCount = batch.quantity;
    await batch.save();
  }
  return batch;
};

export const disableTag = async (tagId: string) => {
  const tag = await TagModel.findByIdAndUpdate(
    tagId,
    { status: "disabled" },
    { new: true }
  );
  if (!tag) throw new ApiError(404, "QR not found");
  return tag;
};

export const exportBatchRows = async (batchId: string) => {
  const batch = await TagBatchModel.findById(batchId).lean();
  if (!batch) throw new ApiError(404, "Batch not found");
  const tags = await TagModel.find({ batchId })
    .select("serial publicToken activationCode qrImage status")
    .sort({ serial: 1 })
    .lean();
  await TagBatchModel.updateOne({ _id: batchId }, { $set: { exportedAt: new Date() } });
  return {
    batch,
    tags: tags.map((t) => ({
      serial: t.serial,
      publicToken: t.publicToken,
      activationCode: t.activationCode,
      status: t.status,
      qrImage: t.qrImage,
      publicUrl: `/scan/${t.publicToken}`
    }))
  };
};

export const activateTag = async (args: {
  activationCode: string;
  userId: string;
  assetType?: "car" | "keys";
  carId?: string;
  carPayload?: {
    registrationNumber: string;
    make?: string;
    model?: string;
    color?: string;
    year?: number;
    nickname?: string;
    plateImage?: string;
  };
  keyPayload?: {
    label: string;
    keyType: string;
    description?: string;
    returnInstructions?: string;
    image?: string;
  };
  ipAddress?: string;
  userAgent?: string;
}) => {
  const code = args.activationCode.trim().toUpperCase();
  const assetType = args.assetType ?? "car";

  const user = await UserModel.findById(args.userId);
  if (!user) throw new ApiError(404, "User not found");
  if (!user.phoneVerifiedAt) throw new ApiError(403, "Phone not verified. Verify your WhatsApp OTP before activation.");

  const windowStart = new Date(Date.now() - ATTEMPT_WINDOW_MS);
  const recent = await ActivationAttemptModel.countDocuments({
    $or: [{ userId: args.userId }, { ipAddress: args.ipAddress ?? "" }],
    outcome: { $ne: "success" },
    createdAt: { $gte: windowStart }
  });
  if (recent >= MAX_ATTEMPTS_PER_WINDOW) {
    await ActivationAttemptModel.create({
      userId: args.userId,
      ipAddress: args.ipAddress ?? "",
      activationCode: code,
      outcome: "rate_limited",
      reason: "too_many_attempts"
    });
    throw new ApiError(429, "Too many activation attempts. Try again later.");
  }

  const recordAttempt = (outcome: string, reason = "") =>
    ActivationAttemptModel.create({
      userId: args.userId,
      ipAddress: args.ipAddress ?? "",
      activationCode: code,
      outcome,
      reason
    }).catch(() => undefined);

  const tag = await TagModel.findOne({ activationCode: code });
  if (!tag) {
    await recordAttempt("invalid_code", "no_tag");
    throw new ApiError(404, "Invalid activation code");
  }
  if (tag.status === "activated") {
    await recordAttempt("already_used", "tag_activated");
    throw new ApiError(409, "This activation code has already been used");
  }
  if (tag.status === "disabled" || tag.status === "lost") {
    await recordAttempt("disabled", `tag_${tag.status}`);
    throw new ApiError(400, "This QR is not available for activation");
  }

  if (assetType === "car") {
    let carId = args.carId;
    if (!carId) {
      if (!args.carPayload) {
        await recordAttempt("error", "missing_car_details");
        throw new ApiError(400, "Provide car details or select an existing car");
      }
      const existing = await CarModel.findOne({
        userId: args.userId,
        registrationNumber: args.carPayload.registrationNumber
      });
      if (existing) {
        carId = existing.id;
      } else {
        const count = await CarModel.countDocuments({ userId: args.userId });
        const car = await CarModel.create({
          userId: args.userId,
          registrationNumber: args.carPayload.registrationNumber,
          make: args.carPayload.make ?? "",
          model: args.carPayload.model ?? "",
          color: args.carPayload.color ?? "",
          year: args.carPayload.year,
          nickname: args.carPayload.nickname ?? "",
          plateImage: args.carPayload.plateImage ?? "",
          isPrimary: count === 0,
          activationStatus: "activated"
        });
        carId = car.id;
      }
    } else {
      const car = await CarModel.findOne({ _id: carId, userId: args.userId });
      if (!car) {
        await recordAttempt("error", "car_not_found");
        throw new ApiError(404, "Car not found");
      }
      if (args.carPayload?.plateImage && !car.plateImage) {
        car.plateImage = args.carPayload.plateImage;
        await car.save();
      }
    }

    tag.ownerUserId = args.userId as any;
    tag.linkedAssetType = "car";
    tag.carId = carId as any;
    tag.keyId = undefined;
    tag.status = "activated";
    tag.activatedAt = new Date();
    await tag.save();

    await CarModel.updateOne({ _id: carId }, { $set: { activeTagId: tag.id, activationStatus: "activated" } });

    await ActivationRecordModel.create({
      tagId: tag._id,
      serial: tag.serial,
      activationCode: tag.activationCode,
      userId: args.userId,
      carId,
      outcome: "success",
      ipAddress: args.ipAddress ?? "",
      userAgent: args.userAgent ?? "",
      message: "Tag activated and bound to car"
    });

    await recordAttempt("success");
    return { tag, carId };
  }

  if (assetType === "keys") {
    if (!args.keyPayload) {
      await recordAttempt("error", "missing_keys_details");
      throw new ApiError(400, "Provide keys details to activate this QR");
    }
    const key = await KeyModel.create({
      ownerId: args.userId,
      qrId: tag.id,
      label: args.keyPayload.label,
      keyType: args.keyPayload.keyType,
      description: args.keyPayload.description ?? "",
      image: args.keyPayload.image ?? "",
      returnInstructions: args.keyPayload.returnInstructions ?? ""
    });

    tag.ownerUserId = args.userId as any;
    tag.linkedAssetType = "keys";
    tag.keyId = key.id as any;
    tag.carId = undefined;
    tag.status = "activated";
    tag.activatedAt = new Date();
    await tag.save();

    await ActivationRecordModel.create({
      tagId: tag._id,
      serial: tag.serial,
      activationCode: tag.activationCode,
      userId: args.userId,
      keyId: key.id,
      outcome: "success",
      ipAddress: args.ipAddress ?? "",
      userAgent: args.userAgent ?? "",
      message: "Tag activated and bound to keys"
    });

    await recordAttempt("success");
    return { tag, carId: undefined, keyId: key.id };
  }

  await recordAttempt("success");

  return { tag, carId: undefined };
};

export const listUserTags = async (userId: string) => {
  return TagModel.find({ ownerUserId: userId })
    .populate("carId", "registrationNumber make model nickname")
    .sort({ createdAt: -1 })
    .lean();
};

export const listActivationRecords = async (filters: {
  search?: string;
  outcome?: string;
  limit?: number;
}) => {
  const query: any = {};
  if (filters.outcome) query.outcome = filters.outcome;
  if (filters.search) {
    const rx = new RegExp(filters.search, "i");
    query.$or = [{ serial: rx }, { activationCode: filters.search.toUpperCase() }];
  }
  return ActivationRecordModel.find(query)
    .populate("userId", "name email phone")
    .populate("carId", "registrationNumber make model nickname")
    .populate("tagId", "serial publicToken status")
    .sort({ createdAt: -1 })
    .limit(filters.limit ?? 200)
    .lean();
};

export const listUserActivationHistory = async (userId: string) =>
  ActivationRecordModel.find({ userId })
    .populate("carId", "registrationNumber make model nickname")
    .populate("tagId", "serial publicToken")
    .sort({ createdAt: -1 })
    .lean();
