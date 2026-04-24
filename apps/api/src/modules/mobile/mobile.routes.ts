import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { registerPushToken, unregisterPushToken } from "./mobile.controller.js";

export const mobileRouter = Router();
mobileRouter.use(requireAuth, requireRole("owner"));

mobileRouter.post("/push-token", registerPushToken);
mobileRouter.delete("/push-token", unregisterPushToken);
