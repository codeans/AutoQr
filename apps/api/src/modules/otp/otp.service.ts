import crypto from "node:crypto";
import { OtpChallengeModel } from "../../models/OtpChallenge.js";
import { UserModel } from "../../models/User.js";
import { ApiError } from "../../utils/apiError.js";
import { hashPassword, sha256 } from "../../utils/crypto.js";
import { signAccessToken, signRefreshToken } from "../../utils/jwt.js";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { addDays } from "../common/date.js";
import { dispatchNotification } from "../../infrastructure/notifications/notification.service.js";
import { logger } from "../../utils/logger.js";

const OTP_TTL_SECONDS = 5 * 60;
const MIN_RESEND_INTERVAL_MS = 30 * 1000;
const MAX_RESEND_PER_WINDOW = 5;
const WINDOW_MS = 15 * 60 * 1000;

export type OtpPurpose = "login" | "signup" | "phone_verify" | "activation";

const normalizePhone = (phone: string) => phone.replace(/\s+/g, "").trim();

const generateNumericCode = (length = 6) => {
  const digits = "0123456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += digits[crypto.randomInt(0, 10)];
  }
  return out;
};

const hashCode = (code: string, phone: string) => sha256(`${code}:${phone}`);

export const requestOtp = async (args: {
  phone: string;
  purpose?: OtpPurpose;
  ipAddress?: string;
  userAgent?: string;
  channels?: Array<"sms" | "whatsapp">;
}) => {
  const phone = normalizePhone(args.phone);
  const purpose: OtpPurpose = args.purpose ?? "login";

  const windowStart = new Date(Date.now() - WINDOW_MS);
  const recent = await OtpChallengeModel.countDocuments({
    phone,
    createdAt: { $gte: windowStart }
  });
  if (recent >= MAX_RESEND_PER_WINDOW) {
    throw new ApiError(429, "Too many OTP requests. Please wait a few minutes.");
  }

  const latest = await OtpChallengeModel.findOne({ phone }).sort({ createdAt: -1 });
  if (latest && Date.now() - latest.createdAt!.getTime() < MIN_RESEND_INTERVAL_MS) {
    throw new ApiError(429, "Please wait before requesting another code.");
  }

  const code = generateNumericCode(6);
  const codeHash = hashCode(code, phone);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await OtpChallengeModel.create({
    phone,
    codeHash,
    purpose,
    expiresAt,
    ipAddress: args.ipAddress ?? "",
    userAgent: args.userAgent ?? ""
  });

  const inDev = process.env.NODE_ENV !== "production";

  await dispatchNotification({
    phone,
    type: "otp",
    title: "Your verification code",
    message: `Your code is ${code}. It expires in ${OTP_TTL_SECONDS / 60} minutes.`,
    channels: args.channels ?? ["sms", "whatsapp"]
  }).catch((err) => logger.warn("otp.dispatch.failed", { error: err?.message }));

  return {
    phone,
    purpose,
    expiresInSeconds: OTP_TTL_SECONDS,
    devCode: inDev ? code : undefined
  };
};

export const verifyOtp = async (args: {
  phone: string;
  code: string;
  purpose?: OtpPurpose;
  signup?: { name: string; email: string; address: string; password?: string };
}) => {
  const phone = normalizePhone(args.phone);
  const codeHash = hashCode(args.code, phone);

  const challenge = await OtpChallengeModel.findOne({
    phone,
    consumedAt: { $exists: false },
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!challenge) throw new ApiError(400, "OTP expired or not found. Request a new code.");
  if (challenge.attempts >= challenge.maxAttempts) {
    throw new ApiError(429, "Too many attempts. Request a new code.");
  }

  if (challenge.codeHash !== codeHash) {
    challenge.attempts += 1;
    await challenge.save();
    throw new ApiError(400, "Incorrect code.");
  }

  challenge.consumedAt = new Date();
  await challenge.save();

  let user = await UserModel.findOne({ phone });

  if (!user) {
    if (!args.signup) {
      throw new ApiError(404, "Account not found. Please sign up first.");
    }
    user = await UserModel.create({
      name: args.signup.name,
      email: args.signup.email.toLowerCase(),
      phone,
      address: args.signup.address,
      passwordHash: args.signup.password ? hashPassword(args.signup.password) : hashPassword(crypto.randomBytes(24).toString("hex")),
      phoneVerifiedAt: new Date(),
      role: "owner"
    });
  } else if (!user.phoneVerifiedAt) {
    user.phoneVerifiedAt = new Date();
    await user.save();
  }

  user.lastLoginAt = new Date();
  await user.save();

  const jwtPayload = { userId: user.id, role: user.role as "admin" | "owner" };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);
  await RefreshTokenModel.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: addDays(new Date(), 7)
  });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      phoneVerified: Boolean(user.phoneVerifiedAt)
    }
  };
};
