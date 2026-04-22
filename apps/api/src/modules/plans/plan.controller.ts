import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  adminArchivePlan,
  adminListPlans,
  adminUpsertPlan,
  getPlanBySlug,
  listActivePlans
} from "./plan.service.js";

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

export const adminArchive = asyncHandler(async (req: Request, res: Response) => {
  const plan = await adminArchivePlan(String(req.params.id));
  res.json({ plan });
});
