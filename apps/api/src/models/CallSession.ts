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
      enum: ["ringing", "accepted", "active", "connected", "ended", "missed", "declined", "rejected", "failed", "cancelled"],
      default: "ringing",
      index: true
    },
    startedAt: { type: Date },
    endedAt: { type: Date },
    duration: { type: Number, default: 0 },
    agoraChannelName: { type: String, default: "", index: true },
    agoraUidCaller: { type: Number },
    agoraUidReceiver: { type: Number },
    agoraJoinedAt: { type: Date },
    agoraDisconnectedAt: { type: Date },
    endReason: { type: String, default: "" },
    rejectionReason: { type: String, default: "" }
    ,
    pushStatus: {
      type: String,
      enum: ["pending", "sent", "failed"],
      default: "pending"
    },
    pushSentAt: { type: Date },
    pushError: { type: String, default: "" }
  },
  { timestamps: true }
);

callSessionSchema.index(
  { incidentId: 1, ownerUserId: 1 },
  {
    name: "uniq_live_call_per_incident_owner",
    unique: true,
    partialFilterExpression: {
      status: { $in: ["ringing", "accepted", "active", "connected"] }
    }
  }
);

export const CallSessionModel = mongoose.model("CallSession", callSessionSchema);
