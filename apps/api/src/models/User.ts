import mongoose, { Schema } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["admin", "owner"], default: "owner", index: true },
    status: { type: String, enum: ["active", "inactive", "flagged"], default: "active" },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model("User", userSchema);
