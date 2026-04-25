import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  callsList,
  callDetail,
  dashboard,
  incidentDetail,
  listIncidents,
  listNotifications,
  ordersList,
  profile,
  updateLanguage,
  updateProfile
} from "./owner.controller.js";

export const ownerRouter = Router();
ownerRouter.use(requireAuth, requireRole("owner"));

ownerRouter.get("/dashboard", dashboard);
ownerRouter.get("/incidents", listIncidents);
ownerRouter.get("/incidents/:id", incidentDetail);
ownerRouter.get("/calls", callsList);
ownerRouter.get("/calls/:callId", callDetail);
ownerRouter.get("/orders", ordersList);
ownerRouter.get("/profile", profile);
ownerRouter.put("/profile", updateProfile);
ownerRouter.put("/language", updateLanguage);
ownerRouter.get("/notifications", listNotifications);
