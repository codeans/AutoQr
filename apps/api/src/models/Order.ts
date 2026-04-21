import mongoose, { Schema } from "mongoose";

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    vehicleOrItemId: { type: Schema.Types.ObjectId, ref: "VehicleOrItem", required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "EUR" },
    paymentStatus: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending", index: true },
    orderStatus: {
      type: String,
      enum: ["created", "paid", "cancelled", "fulfillment_in_progress", "delivered"],
      default: "created"
    },
    invoiceNumber: { type: String, default: "" }
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model("Order", orderSchema);
