import type { Request, Response } from "express";
import { AdminAuditLogModel } from "../../models/AdminAuditLog.js";
import { AppSettingModel } from "../../models/AppSetting.js";
import { CallSessionModel } from "../../models/CallSession.js";
import { CmsContentModel } from "../../models/CmsContent.js";
import { IncidentModel } from "../../models/Incident.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { QRCodeModel } from "../../models/QRCode.js";
import { UserModel } from "../../models/User.js";
import { VehicleOrItemModel } from "../../models/VehicleOrItem.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { fulfillPaidOrder } from "../payments/payment.service.js";
import { resolveStoredUploadPath } from "../../utils/uploads.js";
import { z } from "zod";

const userStatusSchema = z.object({
  status: z.enum(["active", "inactive", "flagged"])
});

const vehicleStatusSchema = z.object({
  status: z.enum(["pending_payment", "paid", "qr_generated", "printing", "packed", "dispatched", "delivered", "activated"])
});

const qrStatusSchema = z.object({
  status: z.enum(["generated", "printed", "packed", "dispatched", "delivered", "activated", "disabled"])
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
  const [users, paidOrders, qrs, activeItems, incidents, calls, revenueRows, pendingShipments, recentActivity] = await Promise.all([
    UserModel.countDocuments(),
    OrderModel.countDocuments({ paymentStatus: "success" }),
    QRCodeModel.countDocuments(),
    VehicleOrItemModel.countDocuments({ status: { $in: ["qr_generated", "printing", "packed", "dispatched", "delivered", "activated"] } }),
    IncidentModel.countDocuments(),
    CallSessionModel.countDocuments(),
    PaymentModel.find({ status: "success" }),
    QRCodeModel.countDocuments({ status: { $in: ["generated", "printed", "packed", "dispatched"] } }),
    AdminAuditLogModel.find().sort({ createdAt: -1 }).limit(12)
  ]);
  const revenue = revenueRows.reduce((acc, p) => acc + p.amount, 0);
  res.json({
    totals: { users, paidOrders, qrs, activeItems, incidents, calls, revenue, pendingShipments },
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

export const listVehicles = asyncHandler(async (_req: Request, res: Response) => {
  const vehicles = await VehicleOrItemModel.find().populate("userId", "name email phone").sort({ createdAt: -1 });
  res.json({ vehicles });
});

export const updateVehicleStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = vehicleStatusSchema.parse(req.body);
  const vehicle = await VehicleOrItemModel.findByIdAndUpdate(
    req.params.id,
    { $set: { status: payload.status } },
    { new: true, runValidators: true }
  );
  if (!vehicle) throw new ApiError(404, "Vehicle/item not found");
  await audit(req.auth!.userId, "vehicle_status_updated", "vehicle", vehicle.id, { status: payload.status });
  res.json({ vehicle });
});

export const listOrders = asyncHandler(async (_req: Request, res: Response) => {
  const orders = await OrderModel.find().populate("userId", "name email").populate("vehicleOrItemId").sort({ createdAt: -1 });
  res.json({ orders });
});

export const markOrderComplete = asyncHandler(async (req: Request, res: Response) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const transactionId = `admin-manual-${order.id}`;
  await fulfillPaidOrder(order.id, transactionId, { source: "admin_manual_complete", adminId: req.auth!.userId });

  const updatedOrder = await OrderModel.findById(order.id).populate("userId", "name email").populate("vehicleOrItemId");
  await audit(req.auth!.userId, "order_marked_complete", "order", order.id, { transactionId });
  res.json({ order: updatedOrder });
});

export const listPayments = asyncHandler(async (_req: Request, res: Response) => {
  const payments = await PaymentModel.find().populate("orderId").populate("userId", "name email").sort({ createdAt: -1 });
  res.json({ payments });
});

export const listQrs = asyncHandler(async (_req: Request, res: Response) => {
  const qrs = await QRCodeModel.find().populate("userId", "name email").populate("vehicleOrItemId").sort({ createdAt: -1 });
  res.json({ qrs });
});

export const updateQrStatus = asyncHandler(async (req: Request, res: Response) => {
  const payload = qrStatusSchema.parse(req.body);
  const updates: Record<string, unknown> = { status: payload.status };
  if (payload.status === "printed") updates.printedAt = new Date();
  if (payload.status === "packed") updates.packedAt = new Date();
  if (payload.status === "dispatched") updates.shippedAt = new Date();
  if (payload.status === "delivered") updates.deliveredAt = new Date();
  const statusToVehicleStatus: Record<string, string> = {
    generated: "qr_generated",
    printed: "printing",
    packed: "packed",
    dispatched: "dispatched",
    delivered: "delivered",
    activated: "activated"
  };
  const qr = await QRCodeModel.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
  if (!qr) throw new ApiError(404, "QR not found");
  if (statusToVehicleStatus[payload.status]) {
    await VehicleOrItemModel.updateOne({ _id: qr.vehicleOrItemId }, { $set: { status: statusToVehicleStatus[payload.status] } });
  }
  await audit(req.auth!.userId, "qr_status_updated", "qr", qr.id, updates);
  res.json({ qr });
});

export const downloadQr = asyncHandler(async (req: Request, res: Response) => {
  const qr = await QRCodeModel.findById(req.params.id);
  if (!qr) throw new ApiError(404, "QR not found");
  const resolvedPath = resolveStoredUploadPath(qr.qrImage);
  res.download(resolvedPath, `${qr.internalCode}.png`);
});

export const previewQr = asyncHandler(async (req: Request, res: Response) => {
  const qr = await QRCodeModel.findById(req.params.id);
  if (!qr) throw new ApiError(404, "QR not found");
  const resolvedPath = resolveStoredUploadPath(qr.qrImage);
  res.sendFile(resolvedPath);
});

export const listIncidents = asyncHandler(async (_req: Request, res: Response) => {
  const incidents = await IncidentModel.find().populate("userId", "name email").populate("vehicleOrItemId").sort({ createdAt: -1 });
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
  const qrs = await QRCodeModel.find({ status: { $in: ["generated", "printed", "packed", "dispatched", "delivered"] } })
    .populate("userId", "name address phone")
    .populate("vehicleOrItemId", "registrationNumber type")
    .sort({ createdAt: -1 });
  res.json({ shipments: qrs });
});

export const updateShipment = asyncHandler(async (req: Request, res: Response) => {
  const payload = shipmentUpdateSchema.parse(req.body);
  const status = payload.status;
  const updates: Record<string, unknown> = {
    status,
    shipmentMeta: { courier: payload.courier ?? "", trackingNumber: payload.trackingNumber ?? "", notes: payload.notes ?? "" }
  };
  if (status === "packed") updates.packedAt = new Date();
  if (status === "dispatched") updates.shippedAt = new Date();
  if (status === "delivered") updates.deliveredAt = new Date();

  const qr = await QRCodeModel.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { new: true, runValidators: true }
  );
  if (!qr) throw new ApiError(404, "QR not found");
  const statusToVehicleStatus: Record<string, string> = {
    packed: "packed",
    dispatched: "dispatched",
    delivered: "delivered"
  };
  if (statusToVehicleStatus[status]) {
    await VehicleOrItemModel.updateOne({ _id: qr.vehicleOrItemId }, { $set: { status: statusToVehicleStatus[status] } });
  }
  await audit(req.auth!.userId, "shipment_updated", "qr", qr.id, payload);
  res.json({ qr });
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
