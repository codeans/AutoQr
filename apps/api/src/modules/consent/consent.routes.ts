import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { adminListConsent, getPolicies, listMyConsent, postRecord } from "./consent.controller.js";

export const consentRouter = Router();
consentRouter.get("/policies", getPolicies);
consentRouter.post("/record", postRecord);
consentRouter.get("/me", requireAuth, listMyConsent);

export const consentAdminRouter = Router();
consentAdminRouter.use(requireAuth, requireRole("admin"));
consentAdminRouter.get("/", adminListConsent);
