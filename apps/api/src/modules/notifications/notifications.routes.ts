import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount
} from "./notifications.controller.js";

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth, requireRole("owner"));

notificationsRouter.get("/", listNotifications);
notificationsRouter.get("/unread-count", unreadCount);
notificationsRouter.patch("/read-all", markAllRead);
notificationsRouter.patch("/:id/read", markRead);
