import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Not found" });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }
  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(422).json({ message: "Validation failed", details: err.flatten() });
  }
  if (err instanceof Error) {
    logger.error("unhandled_error", { message: err.message, stack: err.stack });
  } else {
    logger.error("unhandled_error", { value: String(err) });
  }
  if (env.NODE_ENV !== "production" && err instanceof Error) {
    return res.status(500).json({ message: err.message });
  }
  return res.status(500).json({ message: "Internal server error" });
};
