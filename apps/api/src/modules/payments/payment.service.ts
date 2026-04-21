import { env } from "../../config/env.js";
import { ensureStripe } from "../../infrastructure/payment/stripe.client.js";
import { OrderModel } from "../../models/Order.js";
import { PaymentModel } from "../../models/Payment.js";
import { QRCodeModel } from "../../models/QRCode.js";
import { VehicleOrItemModel } from "../../models/VehicleOrItem.js";
import { ApiError } from "../../utils/apiError.js";
import { generateQrAsset } from "../../infrastructure/qr/qr.service.js";

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
          product_data: { name: "AutoQr One-Time Sticker/Tag" },
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

  const existingQR = await QRCodeModel.findOne({ vehicleOrItemId: order.vehicleOrItemId });
  if (!existingQR) {
    const qr = await generateQrAsset();
    await QRCodeModel.create({
      userId: order.userId,
      vehicleOrItemId: order.vehicleOrItemId,
      internalCode: qr.internalCode,
      qrUrlToken: qr.qrUrlToken,
      qrImage: qr.qrImage,
      status: "generated"
    });
  }

  await VehicleOrItemModel.updateOne({ _id: order.vehicleOrItemId }, { $set: { status: "qr_generated" } });
};
