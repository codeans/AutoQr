import mongoose, { Schema } from "mongoose";

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, default: "stripe" },
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "success", "failed", "refunded"], default: "pending", index: true },
    rawResponse: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const PaymentModel = mongoose.model("Payment", paymentSchema);
