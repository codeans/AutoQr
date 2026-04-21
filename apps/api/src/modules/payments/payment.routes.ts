import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { createCheckout } from "./payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/checkout", requireAuth, requireRole("owner"), createCheckout);
