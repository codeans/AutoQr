import mongoose, { Schema } from "mongoose";

const pushTokenSchema = new Schema(
  {
    token: { type: String, required: true, index: true },
    platform: { type: String, enum: ["ios", "android", "web"], default: "android" },
    tokenType: { type: String, enum: ["expo", "fcm", "voip"], default: "expo", index: true },
    enabled: { type: Boolean, default: true },
    deviceId: { type: String, default: "" },
    appVersion: { type: String, default: "" },
    lastSeen: { type: Date, default: Date.now },
    lastUsedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

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
      incidents: { type: Boolean, default: true },
      calls: { type: Boolean, default: true },
      orders: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    },
    pushTokens: { type: [pushTokenSchema], default: [] },
    preferredLanguage: { type: String, enum: ["de", "en"], default: "de" },
    lastLoginAt: { type: Date }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
