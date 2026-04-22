import mongoose, { Schema } from "mongoose";

const qrCodeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    carId: { type: Schema.Types.ObjectId, ref: "Car", index: true },
    internalCode: { type: String, required: true, unique: true },
    qrUrlToken: { type: String, required: true, unique: true },
    qrImage: { type: String, required: true },
    visibility: { type: String, enum: ["adminOnly"], default: "adminOnly" },
    status: {
      type: String,
      enum: ["ungenerated", "generated", "printed", "packed", "dispatched", "delivered", "activated", "disabled"],
      default: "generated"
    },
    generatedAt: { type: Date, default: Date.now },
    printedAt: { type: Date },
    packedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    shipmentMeta: {
      courier: { type: String, default: "" },
      trackingNumber: { type: String, default: "" },
      notes: { type: String, default: "" }
    }
  },
  { timestamps: true }
);

export const QRCodeModel = mongoose.model("QRCode", qrCodeSchema);
