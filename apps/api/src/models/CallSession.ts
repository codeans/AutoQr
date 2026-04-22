import mongoose, { Schema } from "mongoose";

const callSessionSchema = new Schema(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterSessionId: { type: String, required: true },
    reporterPhone: { type: String, default: "" },
    ownerPlatform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web"
    },
    reporterPlatform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web"
    },
    status: {
      type: String,
      enum: ["ringing", "accepted", "connected", "ended", "missed", "rejected", "failed", "cancelled"],
      default: "ringing",
      index: true
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    endReason: { type: String, default: "" },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

export const CallSessionModel = mongoose.model("CallSession", callSessionSchema);
