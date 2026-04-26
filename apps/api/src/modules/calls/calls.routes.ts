import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { acceptCall, declineCall, markCallMissed } from "./calls.controller.js";

export const callsRouter = Router();
callsRouter.use(requireAuth, requireRole("owner"));

callsRouter.post("/:callId/accept", acceptCall);
callsRouter.post("/:callId/decline", declineCall);
callsRouter.post("/:callId/missed", markCallMissed);
