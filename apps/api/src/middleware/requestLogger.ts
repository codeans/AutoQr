import type { NextFunction, Request, Response } from "express";
import { logger } from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const started = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - started;
    logger.info("http_request", {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: duration
    });
  });
  next();
};
