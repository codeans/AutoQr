import mongoose, { Schema } from "mongoose";

const vehicleOrItemSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true },
    registrationNumber: { type: String, required: true, index: true },
    frontImage: { type: String, required: true },
    details: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending_payment", "paid", "qr_generated", "printing", "packed", "dispatched", "delivered", "activated"],
      default: "pending_payment"
    }
  },
  { timestamps: true }
);

vehicleOrItemSchema.index({ userId: 1, registrationNumber: 1 }, { unique: true });

export const VehicleOrItemModel = mongoose.model("VehicleOrItem", vehicleOrItemSchema);
