import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import {
  deleteContactHandler,
  getContacts,
  postContact,
  postReorder,
  putContact
} from "./emergency.controller.js";

export const emergencyRouter = Router();
emergencyRouter.use(requireAuth);
emergencyRouter.get("/", getContacts);
emergencyRouter.post("/", postContact);
emergencyRouter.put("/:id", putContact);
emergencyRouter.delete("/:id", deleteContactHandler);
emergencyRouter.post("/reorder", postReorder);
