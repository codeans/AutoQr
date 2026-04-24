import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createContact,
  deleteContact,
  listContacts,
  reorderContacts,
  updateContact
} from "./emergency.service.js";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  relationship: z.string().optional().default(""),
  phone: z.string().min(6).max(32),
  email: z.string().email().optional().or(z.literal("")).default(""),
  priority: z.number().int().min(1).max(20).optional(),
  notifyOnEmergencyOnly: z.boolean().optional()
});

export const getContacts = asyncHandler(async (req: Request, res: Response) => {
  const contacts = await listContacts(req.auth!.userId);
  res.json({ contacts });
});

export const postContact = asyncHandler(async (req: Request, res: Response) => {
  const body = contactSchema.parse(req.body);
  const contact = await createContact(req.auth!.userId, body);
  res.status(201).json({ contact });
});

export const putContact = asyncHandler(async (req: Request, res: Response) => {
  const body = contactSchema.partial().parse(req.body);
  const contact = await updateContact(req.auth!.userId, String(req.params.id), body);
  res.json({ contact });
});

export const deleteContactHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await deleteContact(req.auth!.userId, String(req.params.id));
  res.json(result);
});

export const postReorder = asyncHandler(async (req: Request, res: Response) => {
  const { orderedIds } = z.object({ orderedIds: z.array(z.string().min(1)) }).parse(req.body);
  const contacts = await reorderContacts(req.auth!.userId, orderedIds);
  res.json({ contacts });
});
