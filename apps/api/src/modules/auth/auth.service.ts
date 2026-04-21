import { addDays } from "../common/date.js";
import { RefreshTokenModel } from "../../models/RefreshToken.js";
import { UserModel } from "../../models/User.js";
import { ApiError } from "../../utils/apiError.js";
import { comparePassword, hashPassword, sha256 } from "../../utils/crypto.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../utils/jwt.js";

export const registerOwner = async (payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}) => {
  const existing = await UserModel.findOne({ email: payload.email });
  if (existing) throw new ApiError(409, "Email already registered");

  const user = await UserModel.create({
    name: payload.name,
    email: payload.email,
    passwordHash: await hashPassword(payload.password),
    phone: payload.phone,
    address: payload.address,
    role: "owner"
  });
  return user;
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const user = await UserModel.findOne({ email: payload.email });
  if (!user) throw new ApiError(401, "Invalid credentials");
  const valid = await comparePassword(payload.password, user.passwordHash);
  if (!valid) throw new ApiError(401, "Invalid credentials");
  if (user.status !== "active") throw new ApiError(403, "Account is not active");

  const jwtPayload = { userId: user.id, role: user.role as "admin" | "owner" };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);
  await RefreshTokenModel.create({
    userId: user.id,
    tokenHash: sha256(refreshToken),
    expiresAt: addDays(new Date(), 7)
  });
  const safeUser = {
    _id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address: user.address,
    role: user.role,
    status: user.status
  };
  return { user: safeUser, accessToken, refreshToken };
};

export const rotateRefreshToken = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = sha256(refreshToken);
  const existing = await RefreshTokenModel.findOne({
    userId: payload.userId,
    tokenHash,
    revokedAt: { $exists: false }
  });
  if (!existing || existing.expiresAt < new Date()) throw new ApiError(401, "Invalid refresh token");

  existing.revokedAt = new Date();
  await existing.save();

  const newPayload = { userId: payload.userId, role: payload.role };
  const accessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);
  await RefreshTokenModel.create({
    userId: payload.userId,
    tokenHash: sha256(newRefreshToken),
    expiresAt: addDays(new Date(), 7)
  });

  return { accessToken, refreshToken: newRefreshToken };
};

export const revokeRefreshToken = async (refreshToken: string) => {
  const tokenHash = sha256(refreshToken);
  await RefreshTokenModel.updateOne(
    { tokenHash, revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date() } }
  );
};
