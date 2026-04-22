import mongoose, { Schema } from "mongoose";

const emergencyContactSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    relationship: { type: String, default: "" },
    phone: { type: String, required: true },
    email: { type: String, default: "" },
    priority: { type: Number, default: 1 },
    notifyOnEmergencyOnly: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date }
  },
  { timestamps: true }
);

emergencyContactSchema.index({ userId: 1, priority: 1 });

export const EmergencyContactModel = mongoose.model("EmergencyContact", emergencyContactSchema);
