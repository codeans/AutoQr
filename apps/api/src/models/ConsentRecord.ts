import mongoose, { Schema } from "mongoose";

const consentRecordSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, default: "" },
    type: { type: String, enum: ["terms", "privacy", "marketing", "data_sharing"], required: true },
    version: { type: String, required: true },
    accepted: { type: Boolean, required: true },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    acceptedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const ConsentRecordModel = mongoose.model("ConsentRecord", consentRecordSchema);
