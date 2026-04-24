import mongoose, { Schema } from "mongoose";

const otpChallengeSchema = new Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    purpose: { type: String, enum: ["login", "signup", "phone_verify", "activation"], default: "login" },
    attempts: { type: Number, default: 0 },
    resendCount: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    consumedAt: { type: Date },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

otpChallengeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpChallengeModel = mongoose.model("OtpChallenge", otpChallengeSchema);
