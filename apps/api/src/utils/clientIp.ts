import type { Request } from "express";

/**
 * Best-effort originating client IP behind a single reverse proxy (trust proxy must be enabled).
 */
export function getClientIp(req: Request): string | null {
  const xf = req.headers["x-forwarded-for"];
  const fromHeader = typeof xf === "string" ? xf.split(",")[0]?.trim() : xf?.[0]?.split(",")[0]?.trim();
  const raw = fromHeader || req.socket.remoteAddress || "";
  if (!raw) return null;
  return raw.replace(/^::ffff:/, "");
}
