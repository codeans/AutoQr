import type { Request, Response } from "express";
import { CallSessionModel } from "../../models/CallSession.js";
import { IncidentModel } from "../../models/Incident.js";
import { NotificationModel } from "../../models/Notification.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { QRCodeModel } from "../../models/QRCode.js";
import { UserModel } from "../../models/User.js";
import { VehicleOrItemModel } from "../../models/VehicleOrItem.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { env } from "../../config/env.js";
import { toPublicUploadPath } from "../../utils/uploads.js";
import { z } from "zod";

const createVehicleSchema = z.object({
  type: z.string().min(2).max(120),
  registrationNumber: z.string().min(2).max(120),
  details: z.string().max(2000).optional()
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120),
  phone: z.string().min(7).max(40),
  address: z.string().min(3).max(500),
  notificationPreferences: z
    .object({
      email: z.boolean().optional(),
      inApp: z.boolean().optional()
    })
    .optional()
});

export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
  const payload = createVehicleSchema.parse(req.body);
  const file = req.file;
  if (!file) throw new ApiError(400, "Front image required");
  const vehicle = await VehicleOrItemModel.create({
    userId: req.auth!.userId,
    type: payload.type,
    registrationNumber: payload.registrationNumber,
    frontImage: toPublicUploadPath(file.path),
    details: payload.details ?? ""
  });
  const order = await OrderModel.create({
    userId: req.auth!.userId,
    vehicleOrItemId: vehicle.id,
    amount: Number((env as any).STRIPE_PRICE_EUR_CENTS ?? 4900) / 100,
    currency: "EUR",
    paymentStatus: "pending",
    orderStatus: "created"
  });
  res.status(201).json({ vehicle, order });
});

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const [vehicleCount, incidents, calls, orders, payments] = await Promise.all([
    VehicleOrItemModel.countDocuments({ userId }),
    IncidentModel.find({ userId }).sort({ createdAt: -1 }).limit(5),
    CallSessionModel.find({ ownerUserId: userId }).sort({ createdAt: -1 }).limit(5),
    OrderModel.find({ userId }).sort({ createdAt: -1 }).limit(5),
    PaymentModel.find({ userId }).sort({ createdAt: -1 }).limit(5)
  ]);
  const activeQrCount = await QRCodeModel.countDocuments({ userId, status: { $in: ["generated", "printed", "dispatched", "delivered", "activated"] } });
  res.json({
    summary: {
      vehicleCount,
      activeQrCount,
      incidents: incidents.length,
      calls: calls.length,
      paidOrders: orders.filter((o) => o.paymentStatus === "success").length,
      accountStatus: "active"
    },
    incidents,
    calls,
    orders,
    payments
  });
});

export const listVehicles = asyncHandler(async (req: Request, res: Response) => {
  const vehicles = await VehicleOrItemModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 });
  const ids = vehicles.map((v) => v.id);
  const [qrs, orders] = await Promise.all([
    QRCodeModel.find({ vehicleOrItemId: { $in: ids } }),
    OrderModel.find({ vehicleOrItemId: { $in: ids } }).sort({ createdAt: -1 })
  ]);
  const qrByVehicle = new Map(qrs.map((q) => [String(q.vehicleOrItemId), q.status]));
  const qrMetaByVehicle = new Map(qrs.map((q) => [String(q.vehicleOrItemId), q]));
  const orderByVehicle = new Map(orders.map((o) => [String(o.vehicleOrItemId), o]));
  const statusTimelineOrder = ["pending_payment", "paid", "qr_generated", "printing", "packed", "dispatched", "delivered", "activated"];
  const data = vehicles.map((v) => {
    const qr = qrMetaByVehicle.get(v.id);
    const order = orderByVehicle.get(v.id);
    const currentIdx = statusTimelineOrder.indexOf(v.status);
    return {
      ...v.toObject(),
      qrStatus: qrByVehicle.get(v.id) ?? "ungenerated",
      order,
      shipmentMeta: qr?.shipmentMeta ?? null,
      trackingTimeline: statusTimelineOrder.map((status, index) => ({ status, reached: currentIdx >= index }))
    };
  });
  res.json({ vehicles: data });
});

export const listIncidents = asyncHandler(async (req: Request, res: Response) => {
  const incidents = await IncidentModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 });
  res.json({ incidents });
});

export const incidentDetail = asyncHandler(async (req: Request, res: Response) => {
  const incident = await IncidentModel.findOne({ _id: req.params.id, userId: req.auth!.userId });
  if (!incident) throw new ApiError(404, "Incident not found");
  const calls = await CallSessionModel.find({ incidentId: incident.id }).sort({ createdAt: -1 });
  res.json({ incident, calls });
});

export const callsList = asyncHandler(async (req: Request, res: Response) => {
  const calls = await CallSessionModel.find({ ownerUserId: req.auth!.userId }).sort({ createdAt: -1 });
  res.json({ calls });
});

export const ordersList = asyncHandler(async (req: Request, res: Response) => {
  const orders = await OrderModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 });
  const orderIds = orders.map((o) => o.id);
  const payments = await PaymentModel.find({ orderId: { $in: orderIds } }).sort({ createdAt: -1 });
  const paymentByOrder = new Map(payments.map((p) => [String(p.orderId), p]));
  res.json({
    orders: orders.map((order) => ({
      ...order.toObject(),
      payment: paymentByOrder.get(order.id) ?? null
    }))
  });
});

export const profile = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.auth!.userId).select("-passwordHash");
  res.json({ user });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateProfileSchema.parse(req.body);
  const user = await UserModel.findByIdAndUpdate(
    req.auth!.userId,
    { $set: payload },
    { new: true, runValidators: true }
  ).select("-passwordHash");
  res.json({ user });
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const notifications = await NotificationModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 }).limit(100);
  res.json({ notifications });
});
