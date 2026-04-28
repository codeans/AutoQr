import dotenv from "dotenv";
import path from "node:path";
import { z } from "zod";

dotenv.config();

const toBoolean = z.preprocess((value) => {
  if (typeof value === "boolean") return value;
  if (typeof value !== "string") return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}, z.boolean());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  CLIENT_URL: z.string().url(),
  CORS_ORIGINS: z.string().default(""),
  TRUST_PROXY: toBoolean.default(false),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PRICE_EUR_CENTS: z.coerce.number().default(4900),
  AGORA_APP_ID: z.string().optional().default(""),
  AGORA_APP_CERTIFICATE: z.string().optional().default(""),
  PUBLIC_BASE_URL: z.string().url(),
  UPLOAD_MAX_MB: z.coerce.number().default(8),
  UPLOAD_DIR: z.string().default("uploads"),
  BODY_LIMIT_MB: z.coerce.number().default(2),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().default(10000),
  DB_MAX_RETRIES: z.coerce.number().default(8),
  DB_RETRY_DELAY_MS: z.coerce.number().default(2000),
  SOCKET_PING_TIMEOUT_MS: z.coerce.number().default(20000),
  SOCKET_PING_INTERVAL_MS: z.coerce.number().default(25000),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  FIREBASE_OTP_TEST_TOKEN: z.string().optional().default("")
});

const parsed = envSchema.parse(process.env);
const corsOriginsRaw = parsed.CORS_ORIGINS || process.env.CORS_ORIGIN || "";

export const env = {
  ...parsed,
  CORS_ORIGIN_LIST: [parsed.CLIENT_URL, ...corsOriginsRaw.split(",")]
    .map((entry) => entry.trim())
    .filter(Boolean),
  UPLOAD_DIR_ABSOLUTE: path.resolve(parsed.UPLOAD_DIR)
};
