import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { env } from "../../config/env.js";
import { requestOtp, verifyOtp } from "./otp.service.js";

const requestSchema = z.object({
  phone: z.string().min(6).max(32),
  purpose: z.enum(["login", "signup", "phone_verify", "activation"]).default("login")
});

const verifySchema = z.object({
  phone: z.string().min(6).max(32),
  code: z.string().min(4).max(8),
  purpose: z.enum(["login", "signup", "phone_verify", "activation"]).default("login"),
  signup: z
    .object({
      name: z.string().min(2).max(120),
      email: z.string().email(),
      address: z.string().min(3).max(500),
      password: z.string().min(8).optional()
    })
    .optional()
});

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.NODE_ENV === "production",
  path: "/api/auth/refresh"
};

export const postRequestOtp = asyncHandler(async (req: Request, res: Response) => {
  const body = requestSchema.parse(req.body);
  const result = await requestOtp({
    phone: body.phone,
    purpose: body.purpose,
    ipAddress: req.ip,
    userAgent: req.get("user-agent") ?? ""
  });
  res.json(result);
});

export const postVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const body = verifySchema.parse(req.body);
  const result = await verifyOtp(body);
  res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);
  res.json({ accessToken: result.accessToken, user: result.user });
});
