import { env } from "../../config/env.js";
import { ensureStripe } from "../../infrastructure/payment/stripe.client.js";
import { PlanModel } from "../../models/Plan.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { TagModel } from "../../models/Tag.js";
import { ApiError } from "../../utils/apiError.js";
import { isCatalogPlanSlug, mergePublicPlanFromCatalog } from "../plans/plan.service.js";

export const createCheckoutSession = async (orderId: string, userId: string) => {
  const order = await OrderModel.findOne({ _id: orderId, userId });
  if (!order) throw new ApiError(404, "Order not found");
  const stripe = ensureStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "eur",
          product_data: { name: "AutoQR Car QR Sticker/Tag" },
          unit_amount: env.STRIPE_PRICE_EUR_CENTS
        },
        quantity: 1
      }
    ],
    metadata: { orderId: order.id, userId: String(userId) },
    success_url: `${env.CLIENT_URL}/dashboard/orders?status=success`,
    cancel_url: `${env.CLIENT_URL}/dashboard/orders?status=cancelled`
  });

  await PaymentModel.create({
    orderId: order.id,
    userId,
    provider: "stripe",
    transactionId: session.id,
    amount: order.amount,
    status: "pending",
    rawResponse: session
  });

  return session;
};

export const createPublicCheckoutSession = async (args: {
  planId: string;
  fullName: string;
  phone: string;
  email: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };
  note?: string;
}) => {
  const plan = await PlanModel.findById(args.planId).lean();
  if (!plan || plan.status !== "active" || !isCatalogPlanSlug(String(plan.slug))) {
    throw new ApiError(404, "Plan not available");
  }

  const effective = mergePublicPlanFromCatalog(plan);

  const snapshot = {
    planId: String(plan._id),
    code: effective.code,
    slug: effective.slug,
    name: effective.name,
    priceCents: effective.priceCents,
    currency: effective.currency,
    tagsIncluded: effective.tagsIncluded,
    tier: effective.tier
  };

  const order = await OrderModel.create({
    planId: plan._id,
    planSnapshot: snapshot,
    selectedPlan: effective.slug,
    amount: effective.priceCents / 100,
    currency: effective.currency,
    tagQuantity: effective.tagsIncluded,
    paymentStatus: "pending",
    orderStatus: "pending_payment",
    customerName: args.fullName,
    phone: args.phone,
    email: args.email,
    shippingAddress: {
      fullName: args.fullName,
      phone: args.phone,
      line1: args.shippingAddress.line1,
      line2: args.shippingAddress.line2 ?? "",
      city: args.shippingAddress.city,
      postalCode: args.shippingAddress.postalCode,
      country: args.shippingAddress.country
    },
    fulfillment: {
      notes: args.note ?? ""
    }
  });

  const stripe = ensureStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: (order.currency ?? "eur").toLowerCase(),
          product_data: { name: `AutoQR — ${effective.name}` },
          unit_amount: effective.priceCents
        },
        quantity: 1
      }
    ],
    metadata: { orderId: order.id },
    success_url: `${env.CLIENT_URL}/onboard/success?orderId=${order.id}&public=1`,
    cancel_url: `${env.CLIENT_URL}/onboard/success?orderId=${order.id}&public=1&cancelled=1`
  });

  await PaymentModel.create({
    orderId: order.id,
    provider: "stripe",
    transactionId: session.id,
    amount: order.amount,
    status: "pending",
    rawResponse: session
  });

  return session;
};

export const fulfillPaidOrder = async (orderId: string, transactionId: string, rawResponse: unknown) => {
  const order = await OrderModel.findById(orderId);
  if (!order) return;
  order.paymentStatus = "success";
  order.orderStatus = "paid";
  await order.save();

  const paymentForTransaction = await PaymentModel.findOne({ orderId: order.id, transactionId });
  if (paymentForTransaction) {
    paymentForTransaction.status = "success";
    paymentForTransaction.rawResponse = rawResponse;
    await paymentForTransaction.save();
  } else {
    const pendingPayment = await PaymentModel.findOne({ orderId: order.id, status: "pending" }).sort({ createdAt: -1 });
    if (pendingPayment) {
      pendingPayment.status = "success";
      pendingPayment.rawResponse = rawResponse;
      await pendingPayment.save();
    } else {
      await PaymentModel.create({
        orderId: order.id,
        userId: order.userId,
        provider: "manual",
        transactionId,
        amount: order.amount,
        status: "success",
        rawResponse
      });
    }
  }

  // Important: QR inventory must remain unlinked until the customer activates it.
  // Admin dispatch will assign physical QR inventory to this order later.
};
