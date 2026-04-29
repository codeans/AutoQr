import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { registerFcmToken, registerPushToken, unregisterFcmToken, unregisterPushToken } from "./mobile.controller.js";

export const mobileRouter = Router();
mobileRouter.use(requireAuth, requireRole("owner"));

mobileRouter.post("/push-token", registerPushToken);
mobileRouter.post("/fcm-token", registerFcmToken);
mobileRouter.delete("/push-token", unregisterPushToken);
mobileRouter.delete("/fcm-token", unregisterFcmToken);
