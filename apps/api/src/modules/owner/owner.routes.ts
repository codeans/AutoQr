import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { vehicleImageUpload } from "../../middleware/upload.js";
import {
  callsList,
  dashboard,
  incidentDetail,
  listIncidents,
  listNotifications,
  listVehicles,
  ordersList,
  profile,
  updateProfile,
  createVehicle
} from "./owner.controller.js";

export const ownerRouter = Router();
ownerRouter.use(requireAuth, requireRole("owner"));

ownerRouter.get("/dashboard", dashboard);
ownerRouter.get("/vehicle", listVehicles);
ownerRouter.post("/vehicle", vehicleImageUpload.single("frontImage"), createVehicle);
ownerRouter.get("/incidents", listIncidents);
ownerRouter.get("/incidents/:id", incidentDetail);
ownerRouter.get("/calls", callsList);
ownerRouter.get("/orders", ordersList);
ownerRouter.get("/profile", profile);
ownerRouter.put("/profile", updateProfile);
ownerRouter.get("/notifications", listNotifications);
