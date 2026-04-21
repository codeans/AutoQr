import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { ownerRouter } from "../modules/owner/owner.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { publicRouter } from "../modules/public/public.routes.js";
import { paymentRouter } from "../modules/payments/payment.routes.js";
import { openApiSpec } from "../docs/openapi.js";
import { isDatabaseReady } from "../config/db.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok" }));
apiRouter.get("/health/ready", (_req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ status: "degraded", db: "disconnected" });
  }
  return res.json({ status: "ok", db: "connected" });
});
apiRouter.get("/docs/openapi", (_req, res) => res.json(openApiSpec));
apiRouter.use("/auth", authRouter);
apiRouter.use("/owner", ownerRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/public", publicRouter);
apiRouter.use("/payments", paymentRouter);
