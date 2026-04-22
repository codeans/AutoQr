import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  createPlanPaymentSession,
  getOnboardingOrder,
  listMyPlanOrders,
  startPlanOrder
} from "./onboarding.service.js";

const addressSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(32),
  line1: z.string().min(3).max(200),
  line2: z.string().optional().default(""),
  city: z.string().min(2).max(120),
  state: z.string().optional().default(""),
  postalCode: z.string().min(2).max(32),
  country: z.string().min(2).max(80)
});

const startSchema = z.object({
  planId: z.string().min(1),
  shippingAddress: addressSchema
});

export const postStart = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Sign in with OTP before starting a plan");
  const body = startSchema.parse(req.body);
  const result = await startPlanOrder({ ...body, userId });
  res.status(result.created ? 201 : 200).json({ order: result.order });
});

export const postPay = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) throw new ApiError(401, "Sign in required");
  const { orderId } = z.object({ orderId: z.string().min(1) }).parse(req.body);
  const result = await createPlanPaymentSession({ orderId, userId });
  if ("alreadyPaid" in result && result.alreadyPaid) {
    return res.json({ alreadyPaid: true });
  }
  if ("manualReview" in result && result.manualReview) {
    return res.json({ manualReview: true, orderId: result.orderId });
  }
  res.json({ url: (result as any).url, id: (result as any).id });
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.auth!.userId;
  const order = await getOnboardingOrder(String(req.params.id), userId);
  res.json({ order });
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await listMyPlanOrders(req.auth!.userId);
  res.json({ orders });
});
