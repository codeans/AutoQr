import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { mobileRouter } from "../modules/mobile/mobile.routes.js";
import { notificationsRouter } from "../modules/notifications/notifications.routes.js";
import { otpRouter } from "../modules/otp/otp.routes.js";
import { ownerRouter } from "../modules/owner/owner.routes.js";
import { adminRouter } from "../modules/admin/admin.routes.js";
import { publicRouter } from "../modules/public/public.routes.js";
import { paymentRouter } from "../modules/payments/payment.routes.js";
import { planAdminRouter, planRouter } from "../modules/plans/plan.routes.js";
import { onboardingRouter } from "../modules/onboarding/onboarding.routes.js";
import { tagAdminRouter, tagOwnerRouter } from "../modules/tags/tag.routes.js";
import { carRouter } from "../modules/cars/car.routes.js";
import { emergencyRouter } from "../modules/emergency/emergency.routes.js";
import { scanOwnerRouter, scanPublicRouter } from "../modules/scan/scan.routes.js";
import { consentAdminRouter, consentRouter } from "../modules/consent/consent.routes.js";
import { analyticsAdminRouter, analyticsRouter } from "../modules/analytics/analytics.routes.js";
import { openApiSpec } from "../docs/openapi.js";
import { isDatabaseReady } from "../config/db.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ status: "ok", service: "AutoQr API" }));
apiRouter.get("/health/ready", (_req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ status: "degraded", service: "AutoQr API", db: "disconnected" });
  }
  return res.json({ status: "ok", service: "AutoQr API", db: "connected" });
});
apiRouter.get("/docs/openapi", (_req, res) => res.json(openApiSpec));

apiRouter.use((_req, res, next) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: "Service is starting", status: "degraded", db: "disconnected" });
  }
  return next();
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/auth/otp", otpRouter);

apiRouter.use("/owner", ownerRouter);
apiRouter.use("/owner/tags", tagOwnerRouter);
apiRouter.use("/owner/cars", carRouter);
apiRouter.use("/owner/emergency-contacts", emergencyRouter);
apiRouter.use("/owner/scan", scanOwnerRouter);

apiRouter.use("/admin", adminRouter);
apiRouter.use("/admin/tags", tagAdminRouter);
apiRouter.use("/admin/plans", planAdminRouter);
apiRouter.use("/admin/consent", consentAdminRouter);
apiRouter.use("/admin/analytics", analyticsAdminRouter);

apiRouter.use("/public", publicRouter);
apiRouter.use("/scan", scanPublicRouter);

apiRouter.use("/plans", planRouter);
apiRouter.use("/onboarding", onboardingRouter);

apiRouter.use("/consent", consentRouter);
apiRouter.use("/analytics", analyticsRouter);

apiRouter.use("/payments", paymentRouter);

apiRouter.use("/mobile", mobileRouter);
apiRouter.use("/notifications", notificationsRouter);
