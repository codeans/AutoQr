import mongoose, { Schema } from "mongoose";

const incidentLocationSchema = new Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracyMeters: { type: Number, required: true },
    locationType: { type: String, enum: ["gps", "ip_based"], required: true },
    capturedAt: { type: Date, required: true },
    permissionStatus: { type: String, enum: ["granted", "fallback_used"], required: true },
    lowAccuracy: { type: Boolean, default: false },
    approxCity: { type: String, default: "" },
    approxCountry: { type: String, default: "" },
    gpsFailureReason: { type: String, default: "" }
  },
  { _id: false }
);

const incidentSchema = new Schema(
  {
    qrCodeId: { type: Schema.Types.ObjectId, ref: "QRCode", index: true },
    tagId: { type: Schema.Types.ObjectId, ref: "Tag", index: true },
    // Car incidents link to `carId`, key incidents link to `keyId`.
    carId: { type: Schema.Types.ObjectId, ref: "Car", required: false, index: true },
    keyId: { type: Schema.Types.ObjectId, ref: "Key", required: false, index: true },
    // Kept for fast branching in UI and admin logs.
    linkedAssetType: { type: String, enum: ["car", "keys"], default: "car", index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterName: { type: String, default: "" },
    reporterPhone: { type: String, required: true },
    reporterPhoneRaw: { type: String, default: "" },
    reporterSessionToken: { type: String, default: "", index: true },
    message: { type: String, required: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["open", "in_review", "resolved", "escalated"], default: "open" },
    adminNotes: { type: String, default: "" },
    escalationFlag: { type: Boolean, default: false },
    callPlatform: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web"
    },
    consentAt: { type: Date, default: Date.now },
    /** Required on public reporter submissions (`POST /public/incident/:token`); omitted on legacy/other flows. */
    location: { type: incidentLocationSchema, required: false }
  },
  { timestamps: true }
);

export const IncidentModel = mongoose.model("Incident", incidentSchema);
