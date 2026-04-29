import mongoose, { Schema } from "mongoose";

const activationRecordSchema = new Schema(
  {
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true, index: true },
    serial: { type: String, required: true, index: true },
    activationCode: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // Car activations set carId; key activations set keyId.
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: false },
    keyId: { type: Schema.Types.ObjectId, ref: "Key", required: false },
    outcome: {
      type: String,
      enum: ["success", "invalid_code", "already_used", "disabled", "rate_limited", "error"],
      required: true,
      index: true
    },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

export const ActivationRecordModel = mongoose.model("ActivationRecord", activationRecordSchema);

const activationAttemptSchema = new Schema(
  {
    ipAddress: { type: String, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    activationCode: { type: String, default: "" },
    outcome: { type: String, required: true },
    reason: { type: String, default: "" }
  },
  { timestamps: true }
);

activationAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export const ActivationAttemptModel = mongoose.model("ActivationAttempt", activationAttemptSchema);
