import mongoose, { Schema } from "mongoose";

const incidentSchema = new Schema(
  {
    qrCodeId: { type: Schema.Types.ObjectId, ref: "QRCode", required: true, index: true },
    vehicleOrItemId: { type: Schema.Types.ObjectId, ref: "VehicleOrItem", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reporterName: { type: String, default: "" },
    reporterPhone: { type: String, required: true },
    message: { type: String, required: true },
    images: { type: [String], default: [] },
    status: { type: String, enum: ["open", "in_review", "resolved", "escalated"], default: "open" },
    adminNotes: { type: String, default: "" },
    escalationFlag: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const IncidentModel = mongoose.model("Incident", incidentSchema);
