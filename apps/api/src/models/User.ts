import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true, index: true },
    phoneVerifiedAt: { type: Date },
    address: { type: String, required: true },
    role: { type: String, enum: ["admin", "owner", "support"], default: "owner", index: true },
    status: { type: String, enum: ["active", "inactive", "flagged"], default: "active" },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
