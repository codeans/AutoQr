import { Router } from "express";
import rateLimit from "express-rate-limit";
import { incidentImageUpload } from "../../middleware/upload.js";
import { createIncident, publicContent, qrInfo, reporterIncidentView } from "./public.controller.js";

const publicIncidentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

export const publicRouter = Router();

publicRouter.get("/incident/:token", qrInfo);
publicRouter.post("/incident/:token", publicIncidentLimiter, incidentImageUpload.array("images", 10), createIncident);
publicRouter.get("/reporter/incident/:incidentId", reporterIncidentView);
publicRouter.get("/content/:slug", publicContent);
