import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  auditLogs,
  content,
  dashboard,
  downloadQr,
  previewQr,
  listCalls,
  listIncidents,
  listOrders,
  listPayments,
  markOrderComplete,
  listQrs,
  listUsers,
  listVehicles,
  settingsGet,
  settingsUpsert,
  shipments,
  updateIncident,
  updateQrStatus,
  updateShipment,
  updateUserStatus,
  updateVehicleStatus,
  upsertContent
} from "./admin.controller.js";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole("admin"));

adminRouter.get("/dashboard", dashboard);
adminRouter.get("/users", listUsers);
adminRouter.patch("/users/:id/status", updateUserStatus);
adminRouter.get("/vehicles", listVehicles);
adminRouter.patch("/vehicles/:id/status", updateVehicleStatus);
adminRouter.get("/orders", listOrders);
adminRouter.post("/orders/:id/complete", markOrderComplete);
adminRouter.get("/payments", listPayments);
adminRouter.get("/qrs", listQrs);
adminRouter.patch("/qrs/:id/status", updateQrStatus);
adminRouter.get("/qrs/:id/preview", previewQr);
adminRouter.get("/qrs/:id/download", downloadQr);
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
