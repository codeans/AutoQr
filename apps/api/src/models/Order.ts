import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    // `userId` is optional for public checkout. We only attach QR inventory on activation.
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", index: true },
    planSnapshot: { type: Schema.Types.Mixed, default: null },
    carId: { type: Schema.Types.ObjectId, ref: "Car", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    stripePaymentId: { type: String, default: "", index: true },
    selectedPlan: { type: String, default: "" },
    customerName: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    paymentStatus: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending", index: true },
    orderStatus: {
      type: String,
      enum: ["pending_payment", "paid", "processing", "dispatched", "delivered", "cancelled", "refunded"],
      default: "pending_payment",
      index: true
    },
    invoiceNumber: { type: String, default: "" },
    tagQuantity: { type: Number, default: 1 },
    shippingAddress: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      line1: { type: String, default: "" },
      line2: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" }
    },
    // Convenience fields (duplicated from `shippingAddress`) for simpler admin filtering.
    city: { type: String, default: "" },
    postalCode: { type: String, default: "" },
    country: { type: String, default: "" },
    fulfillment: {
      courier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      shippedAt: { type: Date },
      deliveredAt: { type: Date },
      notes: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model("Order", orderSchema);
