import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { NotificationModel } from "../../models/Notification.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";

const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(50),
  cursor: z.string().optional(),
  unreadOnly: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
});

const toUnread = (v: unknown) => v === true || v === "true";

const serialize = (doc: any) => {
  const obj = typeof doc?.toObject === "function" ? doc.toObject() : doc;
  const body = obj.body || obj.message || "";
  const isRead = typeof obj.isRead === "boolean" ? obj.isRead : Boolean(obj.readStatus);
  return {
    id: String(obj._id),
    type: obj.type,
    title: obj.title,
    body,
    data: obj.data || {},
    isRead,
    relatedEntityId: obj.relatedEntityId || "",
    createdAt: obj.createdAt,
    readAt: obj.readAt ?? null
  };
};

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const query = listQuerySchema.parse(req.query);
  const filter: Record<string, unknown> = { userId };
  if (toUnread(query.unreadOnly)) filter.isRead = false;
  if (query.cursor && mongoose.isValidObjectId(query.cursor)) {
    filter._id = { $lt: new mongoose.Types.ObjectId(query.cursor) };
  }
  const docs = await NotificationModel.find(filter).sort({ _id: -1 }).limit(query.limit + 1);
  const hasMore = docs.length > query.limit;
  const trimmed = hasMore ? docs.slice(0, query.limit) : docs;
  const [unreadCount, total] = await Promise.all([
    NotificationModel.countDocuments({ userId, isRead: false }),
    NotificationModel.countDocuments({ userId })
  ]);
  res.json({
    notifications: trimmed.map(serialize),
    nextCursor: hasMore ? String(trimmed[trimmed.length - 1]._id) : null,
    unreadCount,
    total
  });
});

export const markRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw new ApiError(400, "Invalid notification id");
  const doc = await NotificationModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true, readStatus: true, readAt: new Date() } },
    { new: true }
  );
  if (!doc) throw new ApiError(404, "Notification not found");
  res.json({ notification: serialize(doc) });
});

export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const result = await NotificationModel.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true, readStatus: true, readAt: new Date() } }
  );
  res.json({ ok: true, modified: result.modifiedCount ?? 0 });
});

export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Unauthorized");
  const count = await NotificationModel.countDocuments({ userId, isRead: false });
  res.json({ count });
});
