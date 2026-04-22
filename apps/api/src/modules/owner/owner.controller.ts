import type { Request, Response } from "express";
import { CallSessionModel } from "../../models/CallSession.js";
import { CarModel } from "../../models/Car.js";
import { IncidentModel } from "../../models/Incident.js";
import { NotificationModel } from "../../models/Notification.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { QRCodeModel } from "../../models/QRCode.js";
import { TagModel } from "../../models/Tag.js";
import { UserModel } from "../../models/User.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import { maskGermanPhone } from "@autoqr/shared";
import { z } from "zod";

const sanitizeIncident = (incident: any) => {
  const doc = typeof incident?.toObject === "function" ? incident.toObject() : { ...incident };
  const maskedPhone = doc.reporterPhone ? maskGermanPhone(doc.reporterPhone) : "";
  delete doc.reporterPhone;
  delete doc.reporterPhoneRaw;
  delete doc.reporterName;
  delete doc.reporterSessionToken;
  doc.reporterPhoneMasked = maskedPhone;
  return doc;
};

const sanitizeCall = (call: any) => {
  const doc = typeof call?.toObject === "function" ? call.toObject() : { ...call };
  const maskedPhone = doc.reporterPhone ? maskGermanPhone(doc.reporterPhone) : "";
  delete doc.reporterPhone;
  delete doc.reporterSessionId;
  doc.reporterPhoneMasked = maskedPhone;
  return doc;
};

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

export const dashboard = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const [carCount, activeTagCount, incidents, calls, orders, payments] = await Promise.all([
    CarModel.countDocuments({ userId }),
    TagModel.countDocuments({ ownerUserId: userId, status: "activated" }),
    IncidentModel.find({ userId }).sort({ createdAt: -1 }).limit(5),
    CallSessionModel.find({ ownerUserId: userId }).sort({ createdAt: -1 }).limit(5),
    OrderModel.find({ userId }).sort({ createdAt: -1 }).limit(5),
    PaymentModel.find({ userId }).sort({ createdAt: -1 }).limit(5)
  ]);
  res.json({
    summary: {
      carCount,
      activeTagCount,
      incidents: incidents.length,
      calls: calls.length,
      paidOrders: orders.filter((o) => o.paymentStatus === "success").length,
      accountStatus: "active"
    },
    incidents: incidents.map(sanitizeIncident),
    calls: calls.map(sanitizeCall),
    orders,
    payments
  });
});

export const listIncidents = asyncHandler(async (req: Request, res: Response) => {
  const incidents = await IncidentModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 });
  res.json({ incidents: incidents.map(sanitizeIncident) });
});

export const incidentDetail = asyncHandler(async (req: Request, res: Response) => {
  const incident = await IncidentModel.findOne({ _id: req.params.id, userId: req.auth!.userId });
  if (!incident) throw new ApiError(404, "Incident not found");
  const calls = await CallSessionModel.find({ incidentId: incident.id }).sort({ createdAt: -1 });
  res.json({ incident: sanitizeIncident(incident), calls: calls.map(sanitizeCall) });
});

export const callsList = asyncHandler(async (req: Request, res: Response) => {
  const calls = await CallSessionModel.find({ ownerUserId: req.auth!.userId }).sort({ createdAt: -1 });
  res.json({ calls: calls.map(sanitizeCall) });
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

// Legacy QR lookups are kept only for historical orders; new inventory flows use Tag/Car.
export const listLegacyQrs = asyncHandler(async (req: Request, res: Response) => {
  const qrs = await QRCodeModel.find({ userId: req.auth!.userId }).sort({ createdAt: -1 });
  res.json({ qrs });
});
