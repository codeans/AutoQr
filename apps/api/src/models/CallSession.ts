import mongoose, { Schema } from "mongoose";

const callSessionSchema = new Schema(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true, index: true },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterSessionId: { type: String, required: true },
    status: { type: String, enum: ["ringing", "connected", "ended", "missed", "rejected"], default: "ringing", index: true },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    rejectionReason: { type: String, default: "" }
  },
  { timestamps: true }
);

export const CallSessionModel = mongoose.model("CallSession", callSessionSchema);
