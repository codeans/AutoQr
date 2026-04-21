import type { Request, Response } from "express";
import type Stripe from "stripe";
import { z } from "zod";
import { env } from "../../config/env.js";
import { ensureStripe } from "../../infrastructure/payment/stripe.client.js";
import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { createCheckoutSession, fulfillPaidOrder } from "./payment.service.js";

const createCheckoutSchema = z.object({
  orderId: z.string().min(1)
});

export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = createCheckoutSchema.parse(req.body);
  const session = await createCheckoutSession(orderId, req.auth!.userId);
  res.json({ sessionId: session.id, url: session.url });
});

export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  const stripe = ensureStripe();
  const signature = req.headers["stripe-signature"] as string;
  if (!signature) throw new ApiError(400, "Missing Stripe signature");
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET);
  } catch {
    throw new ApiError(400, "Invalid Stripe signature");
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      await fulfillPaidOrder(orderId, session.id, session);
    }
  }
  res.json({ received: true });
});
