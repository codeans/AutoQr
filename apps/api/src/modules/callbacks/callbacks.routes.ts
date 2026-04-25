import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { callbackDetail, callbackHistory, endCallback, requestCallback, startCallback } from "./callbacks.controller.js";

export const callbacksRouter = Router();

callbacksRouter.use(requireAuth, requireRole("owner"));
callbacksRouter.post("/request", requestCallback);
callbacksRouter.post("/start", startCallback);
callbacksRouter.post("/end", endCallback);
callbacksRouter.get("/history", callbackHistory);
callbacksRouter.get("/:id", callbackDetail);
