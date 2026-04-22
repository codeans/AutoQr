import mongoose, { Schema } from "mongoose";

const analyticsEventSchema = new Schema(
  {
    type: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    sessionId: { type: String, default: "" },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag" },
    entityId: { type: String, default: "" },
    properties: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    occurredAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

export const AnalyticsEventModel = mongoose.model("AnalyticsEvent", analyticsEventSchema);
