import type { Request, Response } from "express";
import { UserModel } from "../../models/User.js";
import { ApiError } from "../../utils/apiError.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { z } from "zod";
import { loginSchema, registerSchema } from "./auth.validation.js";
import {
  loginUser,
  loginWithFirebaseOtp,
  registerOwner,
  revokeRefreshToken,
  rotateRefreshToken
} from "./auth.service.js";
import { comparePassword, hashPassword } from "../../utils/crypto.js";
import { env } from "../../config/env.js";

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/api/auth/refresh"
};

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8)
});

const firebaseOtpLoginSchema = z.object({
  phone: z.string().min(6).max(32),
  idToken: z.string().min(20).max(4000),
  signup: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      address: z.string().min(3).max(500)
    })
    .optional()
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const payload = registerSchema.parse(req.body);
  const user = await registerOwner(payload);
  const safeUser = await UserModel.findById(user.id).select("-passwordHash");
  res.status(201).json({ user: safeUser });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const payload = loginSchema.parse(req.body);
  const result = await loginUser(payload);
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const firebaseOtpLogin = asyncHandler(async (req: Request, res: Response) => {
  const payload = firebaseOtpLoginSchema.parse(req.body);
  const result = await loginWithFirebaseOtp(payload);
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
  res.json({ accessToken: result.accessToken, user: result.user });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (!refreshToken) throw new ApiError(401, "Missing refresh token");
  const tokens = await rotateRefreshToken(refreshToken);
  res.cookie("refreshToken", tokens.refreshToken, refreshCookieOptions);
  res.json({ accessToken: tokens.accessToken });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await UserModel.findById(req.auth?.userId).select("-passwordHash");
  res.json({ user });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
  const user = await UserModel.findById(req.auth?.userId);
  if (!user) throw new ApiError(404, "User not found");
  const valid = await comparePassword(currentPassword, user.passwordHash);
  if (!valid) throw new ApiError(401, "Current password is invalid");
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  res.json({ message: "Password updated" });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken as string | undefined;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }
  res.clearCookie("refreshToken", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out" });
});
