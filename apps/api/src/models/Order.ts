import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    planId: { type: Schema.Types.ObjectId, ref: "Plan", index: true },
    planSnapshot: { type: Schema.Types.Mixed, default: null },
    carId: { type: Schema.Types.ObjectId, ref: "Car", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    paymentStatus: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending", index: true },
    orderStatus: {
      type: String,
      enum: ["created", "paid", "cancelled", "fulfillment_in_progress", "delivered"],
      default: "created",
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
