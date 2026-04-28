import { Router } from "express";
import { issueAgoraToken } from "../calls/calls.controller.js";

export const agoraRouter = Router();

agoraRouter.post("/token", issueAgoraToken);
