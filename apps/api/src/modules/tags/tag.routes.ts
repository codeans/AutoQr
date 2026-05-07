import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { carImageUpload } from "../../middleware/upload.js";
import {
  adminBulkPrintPdf,
  adminCreateBatch,
  adminDisableTag,
  adminExportBatch,
  adminListActivationRecords,
  adminListBatches,
  adminListTags,
  adminUpdateBatchStatus,
  ownerActivateTag,
  ownerActivateWithUpload,
  ownerActivationHistory,
  ownerListTags
} from "./tag.controller.js";

export const tagAdminRouter = Router();
tagAdminRouter.use(requireAuth, requireRole("admin"));
tagAdminRouter.post("/batches", adminCreateBatch);
tagAdminRouter.get("/batches", adminListBatches);
tagAdminRouter.patch("/batches/:id/status", adminUpdateBatchStatus);
tagAdminRouter.get("/batches/:id/export", adminExportBatch);
tagAdminRouter.post("/print-pdf", adminBulkPrintPdf);
tagAdminRouter.get("/activations", adminListActivationRecords);
tagAdminRouter.get("/", adminListTags);
tagAdminRouter.patch("/:id/disable", adminDisableTag);

const activationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many activation attempts. Please wait and try again." }
});

export const tagOwnerRouter = Router();
tagOwnerRouter.use(requireAuth);
tagOwnerRouter.get("/", ownerListTags);
tagOwnerRouter.get("/activations", ownerActivationHistory);
tagOwnerRouter.post("/activate", activationLimiter, ownerActivateTag);
tagOwnerRouter.post(
  "/activate-with-image",
  activationLimiter,
  carImageUpload.single("plateImage"),
  ownerActivateWithUpload
);
