import type { Request, Response } from "express";
import { AdminAuditLogModel } from "../../models/AdminAuditLog.js";
import { AppSettingModel } from "../../models/AppSetting.js";
import { CallSessionModel } from "../../models/CallSession.js";
import { CarModel } from "../../models/Car.js";
import { CmsContentModel } from "../../models/CmsContent.js";
import { IncidentModel } from "../../models/Incident.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { TagModel } from "../../models/Tag.js";
import { UserModel } from "../../models/User.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { fulfillPaidOrder } from "../payments/payment.service.js";
import { z } from "zod";

const userStatusSchema = z.object({
  status: z.enum(["active", "inactive", "flagged"])
});

const carUpdateSchema = z.object({
  registrationNumber: z.string().min(1).max(40).optional(),
  make: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
  color: z.string().max(120).optional(),
  year: z.number().optional(),
  nickname: z.string().max(120).optional(),
  displayMessage: z.string().max(500).optional(),
  activationStatus: z.enum(["pending", "activated", "deactivated"]).optional()
});

const incidentUpdateSchema = z.object({
  status: z.enum(["open", "in_review", "resolved", "escalated"]),
  adminNotes: z.string().max(5000).optional(),
  escalationFlag: z.boolean().optional()
});

const shipmentUpdateSchema = z.object({
  status: z.enum(["packed", "dispatched", "delivered"]),
  courier: z.string().max(200).optional(),
  trackingNumber: z.string().max(200).optional(),
  notes: z.string().max(2000).optional()
});

const settingsUpsertSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.unknown()
});

const contentUpsertSchema = z.object({
  slug: z.string().min(1).max(150),
  title: z.string().min(1).max(250),
  sections: z.array(z.unknown()).optional(),
  published: z.boolean().optional()
});

const audit = async (adminId: string, action: string, targetType: string, targetId: string, metadata: unknown = {}) =>
  AdminAuditLogModel.create({ adminId, action, targetType, targetId, metadata });

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  const [users, paidOrders, activeCars, activatedTags, incidents, calls, revenueRows, pendingShipments, recentActivity] = await Promise.all([
    UserModel.countDocuments(),
    OrderModel.countDocuments({ paymentStatus: "success" }),
    CarModel.countDocuments({ activationStatus: "activated" }),
    TagModel.countDocuments({ status: "activated" }),
    IncidentModel.countDocuments(),
    CallSessionModel.countDocuments(),
    PaymentModel.find({ status: "success" }),
    TagModel.countDocuments({ status: { $in: ["assigned_to_order", "shipped"] } }),
    AdminAuditLogModel.find().sort({ createdAt: -1 }).limit(12)
  ]);
  const revenue = revenueRows.reduce((acc, p) => acc + p.amount, 0);
  res.json({
    totals: { users, paidOrders, activeCars, activatedTags, incidents, calls, revenue, pendingShipments },
    recentActivity
  });
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserModel.find().select("-passwordHash").sort({ createdAt: -1 });
  res.json({ users });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = userStatusSchema.parse(req.body);
  const user = await UserModel.findByIdAndUpdate(req.params.id, { $set: { status: payload.status } }, { new: true, runValidators: true }).select(
    "-passwordHash"
  );
  if (!user) throw new ApiError(404, "User not found");
  await audit(req.auth!.userId, "user_status_updated", "user", user.id, { status: payload.status });
  res.json({ user });
});

export const listCars = asyncHandler(async (_req: Request, res: Response) => {
  const cars = await CarModel.find().populate("userId", "name email phone").sort({ createdAt: -1 });
  res.json({ cars });
});

export const updateCarStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = carUpdateSchema.parse(req.body);
  const car = await CarModel.findByIdAndUpdate(
    req.params.id,
    { $set: payload },
    { new: true, runValidators: true }
  );
  if (!car) throw new ApiError(404, "Car not found");
  await audit(req.auth!.userId, "car_updated", "car", car.id, payload);
  res.json({ car });
});

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await OrderModel.find().populate("userId", "name email").populate("carId").sort({ createdAt: -1 });
  res.json({ orders });
});

export const markOrderComplete = asyncHandler(async (req: Request, res: Response) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const transactionId = `admin-manual-${order.id}`;
  await fulfillPaidOrder(order.id, transactionId, { source: "admin_manual_complete", adminId: req.auth!.userId });

  const updatedOrder = await OrderModel.findById(order.id).populate("userId", "name email").populate("carId");
  await audit(req.auth!.userId, "order_marked_complete", "order", order.id, { transactionId });
  res.json({ order: updatedOrder });
});

export const listPayments = asyncHandler(async (_req: Request, res: Response) => {
  const payments = await PaymentModel.find().populate("orderId").populate("userId", "name email").sort({ createdAt: -1 });
  res.json({ payments });
});

export const listIncidents = asyncHandler(async (_req: Request, res: Response) => {
  const incidents = await IncidentModel.find().populate("userId", "name email").populate("carId").sort({ createdAt: -1 });
  res.json({ incidents });
});

export const updateIncident = asyncHandler(async (req: Request, res: Response) => {
  const payload = incidentUpdateSchema.parse(req.body);
  const incident = await IncidentModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: payload.status, adminNotes: payload.adminNotes ?? "", escalationFlag: payload.escalationFlag ?? false } },
    { new: true, runValidators: true }
  );
  if (!incident) throw new ApiError(404, "Incident not found");
  await audit(req.auth!.userId, "incident_updated", "incident", incident.id, payload);
  res.json({ incident });
});

export const listCalls = asyncHandler(async (_req: Request, res: Response) => {
  const calls = await CallSessionModel.find().populate("incidentId").populate("ownerUserId", "name email").sort({ createdAt: -1 });
  res.json({ calls });
});

export const shipments = asyncHandler(async (_req: Request, res: Response) => {
  const tags = await TagModel.find({ status: { $in: ["assigned_to_order", "shipped", "delivered"] } })
    .populate("ownerUserId", "name address phone email")
    .populate("orderId")
    .sort({ updatedAt: -1 });
  res.json({ shipments: tags });
});

export const updateShipment = asyncHandler(async (req: Request, res: Response) => {
  const payload = shipmentUpdateSchema.parse(req.body);
  const status = payload.status;
  const tagStatusMap: Record<string, string> = {
    packed: "assigned_to_order",
    dispatched: "shipped",
    delivered: "delivered"
  };
  const updates: Record<string, unknown> = {
    status: tagStatusMap[status] ?? "assigned_to_order"
  };
  if (status === "dispatched") updates.shippedAt = new Date();
  if (status === "delivered") updates.deliveredAt = new Date();

  const tag = await TagModel.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!tag) throw new ApiError(404, "Tag not found");

  if (tag.orderId) {
    const orderStatusMap: Record<string, string> = {
      packed: "fulfillment_in_progress",
      dispatched: "fulfillment_in_progress",
      delivered: "delivered"
    };
    await OrderModel.updateOne(
      { _id: tag.orderId },
      {
        $set: {
          orderStatus: orderStatusMap[status] ?? "fulfillment_in_progress",
          "fulfillment.courier": payload.courier ?? "",
          "fulfillment.trackingNumber": payload.trackingNumber ?? "",
          "fulfillment.notes": payload.notes ?? "",
          ...(status === "dispatched" ? { "fulfillment.shippedAt": new Date() } : {}),
          ...(status === "delivered" ? { "fulfillment.deliveredAt": new Date() } : {})
        }
      }
    );
  }

  await audit(req.auth!.userId, "shipment_updated", "tag", tag.id, payload);
  res.json({ tag });
});

export const content = asyncHandler(async (_req: Request, res: Response) => {
  const pages = await CmsContentModel.find().sort({ updatedAt: -1 });
  res.json({ content: pages });
});

export const settingsGet = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await AppSettingModel.find().sort({ key: 1 });
  res.json({ settings });
});

export const settingsUpsert = asyncHandler(async (req: Request, res: Response) => {
  const { key, value } = settingsUpsertSchema.parse(req.body);
  const doc = await AppSettingModel.findOneAndUpdate({ key }, { $set: { value } }, { new: true, upsert: true, runValidators: true });
  await audit(req.auth!.userId, "settings_updated", "settings", doc.id, { key });
  res.json({ setting: doc });
});

export const upsertContent = asyncHandler(async (req: Request, res: Response) => {
  const { slug, title, sections, published } = contentUpsertSchema.parse(req.body);
  const doc = await CmsContentModel.findOneAndUpdate(
    { slug },
    { $set: { title, sections: sections ?? [], published: published ?? true } },
    { new: true, upsert: true, runValidators: true }
  );
  await audit(req.auth!.userId, "content_updated", "content", doc.id, { slug });
  res.json({ content: doc });
});

export const auditLogs = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await AdminAuditLogModel.find().sort({ createdAt: -1 }).limit(200);
  res.json({ logs });
});
