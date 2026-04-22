import mongoose, { Schema } from "mongoose";

const scanEventSchema = new Schema(
  {
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", required: true, index: true },
    publicToken: { type: String, required: true, index: true },
    carId: { type: Schema.Types.ObjectId, ref: "Car" },
    ownerUserId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    reason: {
      type: String,
      enum: [
        "wrong_parking",
        "headlights_on",
        "flat_tyre",
        "towing",
        "door_or_window_open",
        "car_damaged",
        "accident",
        "other"
      ]
    },
    severity: { type: String, enum: ["info", "urgent", "emergency"], default: "info" },
    message: { type: String, default: "" },
    reporterPhone: { type: String, default: "" },
    reporterName: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    location: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String, default: "" }
    },
    status: {
      type: String,
      enum: ["landed", "alert_sent", "owner_reached", "acknowledged", "closed"],
      default: "landed",
      index: true
    },
    alertChannels: [{ type: String }],
    acknowledgedAt: { type: Date }
  },
  { timestamps: true }
);

export const ScanEventModel = mongoose.model("ScanEvent", scanEventSchema);
