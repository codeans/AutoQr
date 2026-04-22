import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/auth.js";
import {
  getLanding,
  ownerAcknowledge,
  ownerAlertsFeed,
  postAlert,
  postCall
} from "./scan.controller.js";

const scanLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });

export const scanPublicRouter = Router();
scanPublicRouter.get("/:token", getLanding);
scanPublicRouter.post("/:token/alert", scanLimiter, postAlert);
scanPublicRouter.post("/:token/call", scanLimiter, postCall);

export const scanOwnerRouter = Router();
scanOwnerRouter.use(requireAuth);
scanOwnerRouter.get("/alerts", ownerAlertsFeed);
scanOwnerRouter.post("/alerts/:id/ack", ownerAcknowledge);
