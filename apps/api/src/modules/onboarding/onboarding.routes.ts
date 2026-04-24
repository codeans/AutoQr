import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { getOrder, listOrders, postPay, postStart } from "./onboarding.controller.js";

export const onboardingRouter = Router();
onboardingRouter.use(requireAuth);
onboardingRouter.post("/start", postStart);
onboardingRouter.post("/pay", postPay);
onboardingRouter.get("/orders", listOrders);
onboardingRouter.get("/orders/:id", getOrder);
