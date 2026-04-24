import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { adminArchive, adminList, adminUpsert, getPlan, listPlans } from "./plan.controller.js";

export const planRouter = Router();
planRouter.get("/", listPlans);
planRouter.get("/:slug", getPlan);

export const planAdminRouter = Router();
planAdminRouter.use(requireAuth, requireRole("admin"));
planAdminRouter.get("/", adminList);
planAdminRouter.post("/", adminUpsert);
planAdminRouter.put("/:id", adminUpsert);
planAdminRouter.delete("/:id", adminArchive);
