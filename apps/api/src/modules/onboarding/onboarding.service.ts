import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { PlanModel } from "../../models/Plan.js";
import { env } from "../../config/env.js";
import { ensureStripe, stripe } from "../../infrastructure/payment/stripe.client.js";
import { ApiError } from "../../utils/apiError.js";
import { dispatchNotification } from "../../infrastructure/notifications/notification.service.js";

export type ShippingAddress = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

export const startPlanOrder = async (args: {
  planId: string;
  userId: string;
  shippingAddress: ShippingAddress;
}) => {
  const plan = await PlanModel.findById(args.planId);
  if (!plan || plan.status !== "active") throw new ApiError(404, "Plan not available");

  const existingPending = await OrderModel.findOne({
    userId: args.userId,
    planId: plan.id,
    paymentStatus: "pending"
  }).sort({ createdAt: -1 });

  const snapshot = {
    planId: plan.id,
    code: plan.code,
    slug: plan.slug,
    name: plan.name,
    priceCents: plan.priceCents,
    currency: plan.currency,
    tagsIncluded: plan.tagsIncluded,
    tier: plan.tier
  };

  if (existingPending) {
    existingPending.shippingAddress = args.shippingAddress as any;
    existingPending.planSnapshot = snapshot;
    existingPending.amount = plan.priceCents / 100;
    existingPending.currency = plan.currency;
    existingPending.tagQuantity = plan.tagsIncluded;
    existingPending.orderStatus = "pending_payment";
    await existingPending.save();
    return { order: existingPending, created: false };
  }

  const order = await OrderModel.create({
    userId: args.userId,
    planId: plan.id,
    planSnapshot: snapshot,
    amount: plan.priceCents / 100,
    currency: plan.currency,
    tagQuantity: plan.tagsIncluded,
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    shippingAddress: args.shippingAddress as any
  });

  await dispatchNotification({
    userId: args.userId,
    type: "order_status_updated",
    title: "Plan selected",
    message: `You selected the ${plan.name} plan. Complete payment to start shipping.`,
    channels: ["in_app", "email"],
    relatedEntityId: order.id
  }).catch(() => undefined);

  return { order, created: true };
};

export const createPlanPaymentSession = async (args: { orderId: string; userId: string }) => {
  const order = await OrderModel.findOne({ _id: args.orderId, userId: args.userId });
  if (!order) throw new ApiError(404, "Order not found");
  if (order.paymentStatus === "success") {
    return { alreadyPaid: true as const };
  }

  const planName = (order.planSnapshot as any)?.name ?? "AutoQR Plan";

  if (!stripe) {
    const manualTxnId = `manual-pending-${order.id}`;
    const existing = await PaymentModel.findOne({ orderId: order.id });
    if (!existing) {
      await PaymentModel.create({
        orderId: order.id,
        userId: args.userId,
        provider: "manual",
        transactionId: manualTxnId,
        amount: order.amount,
        status: "pending",
        rawResponse: { note: "Stripe disabled — awaiting admin manual approval" }
      });
    }
    return { alreadyPaid: false as const, manualReview: true as const, orderId: order.id };
  }

  const stripeClient = ensureStripe();
  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: (order.currency ?? "eur").toLowerCase(),
          product_data: { name: `AutoQR — ${planName}` },
          unit_amount: Math.round(order.amount * 100)
        },
        quantity: 1
      }
    ],
    metadata: { orderId: order.id, userId: args.userId },
    success_url: `${env.CLIENT_URL}/onboard/success?orderId=${order.id}`,
    cancel_url: `${env.CLIENT_URL}/onboard/review/${order.id}`
  });

  await PaymentModel.create({
    orderId: order.id,
    userId: args.userId,
    provider: "stripe",
    transactionId: session.id,
    amount: order.amount,
    status: "pending",
    rawResponse: session
  });

  return { alreadyPaid: false as const, url: session.url, id: session.id };
};

export const getOnboardingOrder = async (orderId: string, userId: string) => {
  const order = await OrderModel.findOne({ _id: orderId, userId });
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

export const listMyPlanOrders = async (userId: string) => {
  return OrderModel.find({ userId }).sort({ createdAt: -1 });
};
