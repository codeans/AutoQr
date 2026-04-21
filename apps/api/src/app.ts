import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { apiRouter } from "./routes/index.js";
import { stripeWebhook } from "./modules/payments/payment.controller.js";

export const app = express();
if (env.TRUST_PROXY) {
  app.set("trust proxy", 1);
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: env.CORS_ORIGIN_LIST,
    credentials: true
  })
);
app.use(requestLogger);

app.post("/api/payments/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json({ limit: `${env.BODY_LIMIT_MB}mb` }));
app.use(cookieParser());
app.use("/uploads", express.static(env.UPLOAD_DIR_ABSOLUTE));
app.use("/api", apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);
