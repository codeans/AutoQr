import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  auditLogs,
  content,
  dashboard,
  listCalls,
  listCars,
  listIncidents,
  listOrders,
  listPayments,
  markOrderComplete,
  listUsers,
  settingsGet,
  settingsUpsert,
  shipments,
  updateCarStatus,
  updateIncident,
  updateShipment,
  updateUserStatus,
  upsertContent
} from "./admin.controller.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/dashboard", dashboard);
adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id/status", updateUserStatus);
adminRouter.get("/cars", listCars);
adminRouter.patch("/cars/:id", updateCarStatus);
adminRouter.get("/orders", listOrders);
adminRouter.post("/orders/:id/complete", markOrderComplete);
adminRouter.get("/payments", listPayments);
adminRouter.get("/incidents", listIncidents);
adminRouter.patch("/incidents/:id", updateIncident);
adminRouter.get("/calls", listCalls);
adminRouter.get("/shipments", shipments);
adminRouter.patch("/shipments/:id", updateShipment);
adminRouter.get("/content", content);
adminRouter.put("/content", upsertContent);
adminRouter.get("/settings", settingsGet);
adminRouter.put("/settings", settingsUpsert);
adminRouter.get("/audit-logs", auditLogs);
