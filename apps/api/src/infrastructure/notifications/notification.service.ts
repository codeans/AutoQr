import { NotificationModel } from "../../models/Notification.js";
import { UserModel } from "../../models/User.js";
import { logger } from "../../utils/logger.js";
import {
  getNotificationProvider,
  NotificationChannel,
  NotificationPayload,
  NotificationResult
} from "./notification.provider.js";

export type DispatchInput = {
  userId?: string;
  phone?: string;
  email?: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  channels?: NotificationChannel[];
  relatedEntityId?: string;
};

export const dispatchNotification = async (input: DispatchInput) => {
  const results: NotificationResult[] = [];
  const channels = input.channels ?? ["in_app", "email", "sms", "push"];
  let user: any = null;
  if (input.userId) {
    user = await UserModel.findById(input.userId).lean();
  }

  const prefs = user?.notificationPreferences ?? {};
  const phone = input.phone ?? user?.phone;
  const email = input.email ?? user?.email;

  if (channels.includes("in_app") && input.userId) {
    try {
      await NotificationModel.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        relatedEntityId: input.relatedEntityId ?? ""
      });
      results.push({ channel: "in_app", success: true });
    } catch (err: any) {
      results.push({ channel: "in_app", success: false, error: err?.message });
    }
  }

  const sendThrough = async (channel: NotificationChannel, payload: NotificationPayload) => {
    try {
      const provider = getNotificationProvider(channel);
      const result = await provider.send(payload);
      results.push(result);
    } catch (err: any) {
      results.push({ channel, success: false, error: err?.message });
    }
  };

  if (channels.includes("email") && email && prefs.email !== false) {
    await sendThrough("email", { to: email, subject: input.title, body: input.message, data: input.data });
  }

  if (channels.includes("sms") && phone && prefs.sms !== false) {
    await sendThrough("sms", { to: phone, body: `${input.title}: ${input.message}`, data: input.data });
  }

  if (channels.includes("push") && input.userId && prefs.push !== false) {
    await sendThrough("push", { to: input.userId, subject: input.title, body: input.message, data: input.data });
  }

  logger.info("notification.dispatched", {
    type: input.type,
    userId: input.userId,
    channels: results.map((r) => `${r.channel}:${r.success ? "ok" : "fail"}`)
  });

  return results;
};
