import mongoose, { Schema } from "mongoose";

const tagSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "TagBatch", index: true },
    serial: { type: String, required: true, unique: true, index: true },
    publicToken: { type: String, required: true, unique: true, index: true },
    activationCode: { type: String, required: true, unique: true },
    qrImage: { type: String, default: "" },
    status: {
      type: String,
      enum: [
        "in_stock",
        "assigned_to_order",
        "shipped",
        "delivered",
        "activated",
        "disabled",
        "lost"
      ],
      default: "in_stock",
      index: true
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    carId: { type: Schema.Types.ObjectId, ref: "Car" },
    activatedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    lastScanAt: { type: Date },
    scanCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const TagModel = mongoose.model("Tag", tagSchema);
