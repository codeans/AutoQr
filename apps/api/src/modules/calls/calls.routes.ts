import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { acceptCall, declineCall, endCall, issueAgoraToken, markCallMissed, nativeCallAction, startCall } from "./calls.controller.js";

export const callsRouter = Router();

callsRouter.post("/start", startCall);
callsRouter.post("/end", endCall);
callsRouter.post("/:callId/end", endCall);
callsRouter.post("/:callId/native-action", nativeCallAction);
callsRouter.post("/token", issueAgoraToken);
callsRouter.post("/agora/token", issueAgoraToken);

callsRouter.use(requireAuth, requireRole("owner"));
callsRouter.post("/accept", acceptCall);
callsRouter.post("/decline", declineCall);
callsRouter.post("/:callId/accept", acceptCall);
callsRouter.post("/:callId/decline", declineCall);
callsRouter.post("/:callId/missed", markCallMissed);
