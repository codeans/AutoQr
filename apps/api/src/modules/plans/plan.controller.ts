import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/apiError.js";
import {
  adminArchivePlan,
  adminListPlans,
  adminSetPlanPricing,
  adminUpsertPlan,
  getPlanBySlug,
  listActivePlans
} from "./plan.service.js";
import { planPricingPatchSchema } from "./planPricing.schema.js";

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await listActivePlans();
  res.json({ plans });
});

export const getPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await getPlanBySlug(String(req.params.slug));
  res.json({ plan });
});

export const adminList = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await adminListPlans();
  res.json({ plans });
});

export const adminUpsert = asyncHandler(async (req: Request, res: Response) => {
  const plan = await adminUpsertPlan(req.body);
  res.status(201).json({ plan });
});

export const adminUpdatePricing = asyncHandler(async (req: Request, res: Response) => {
  const parsed = planPricingPatchSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, parsed.error.issues.map((i) => i.message).join("; "));
  }
  const plan = await adminSetPlanPricing(String(req.params.id), parsed.data);
  res.json({ plan });
});

export const adminArchive = asyncHandler(async (req: Request, res: Response) => {
  const plan = await adminArchivePlan(String(req.params.id));
  res.json({ plan });
});
