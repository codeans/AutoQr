import { Router } from "express";
import rateLimit from "express-rate-limit";
import { postRequestOtp, postVerifyOtp } from "./otp.controller.js";

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false
});

export const otpRouter = Router();
otpRouter.post("/request", otpLimiter, postRequestOtp);
otpRouter.post("/verify", otpLimiter, postVerifyOtp);
