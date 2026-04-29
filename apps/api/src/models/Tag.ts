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
        "generated",
        "printed",
        "dispatched",
        "unlinked",
        "activated",
        "disabled",
        "lost"
      ],
      default: "generated",
      index: true
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
    // Set only after customer activation. Until then, QR is public but unlinked.
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    // Assets
    linkedAssetType: { type: String, enum: ["car", "keys"], default: null },
    carId: { type: Schema.Types.ObjectId, ref: "Car" },
    keyId: { type: Schema.Types.ObjectId, ref: "Key" },

    activatedAt: { type: Date },
    dispatchedAt: { type: Date },
    unlinkedAt: { type: Date },
    lastScanAt: { type: Date },
    scanCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const TagModel = mongoose.model("Tag", tagSchema);
