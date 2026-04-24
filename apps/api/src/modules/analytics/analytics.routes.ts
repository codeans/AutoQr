import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { adminRecent, adminSummary, postTrack } from "./analytics.controller.js";

export const analyticsRouter = Router();
analyticsRouter.post("/track", postTrack);

export const analyticsAdminRouter = Router();
analyticsAdminRouter.use(requireAuth, requireRole("admin"));
analyticsAdminRouter.get("/summary", adminSummary);
analyticsAdminRouter.get("/events", adminRecent);
