import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    req.auth = verifyAccessToken(token);
  } catch {
    throw new ApiError(401, "Unauthorized");
  }
  next();
};

export const requireRole = (...roles: Array<"admin" | "owner">) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.auth || !roles.includes(req.auth.role)) {
    throw new ApiError(403, "Forbidden");
  }
  next();
};
