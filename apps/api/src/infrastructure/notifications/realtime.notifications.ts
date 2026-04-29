import { NotificationModel, type NotificationType } from "../../models/Notification.js";
import { emitToUser, isUserOnline } from "../../realtime/socket.js";
import { sendPushToUser } from "./expo.push.js";
import { logger } from "../../utils/logger.js";

type ChannelId = "incoming-calls" | "calls" | "incidents" | "default";

export type RealtimeNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  relatedEntityId?: string;
  /** Force a push even if the user is currently connected via socket. Defaults to true for call-related events. */
  forcePush?: boolean;
  /** Skip persistence; only send realtime + push. */
  skipPersist?: boolean;
  /** Persist/socket only. Used when another native channel already owns delivery. */
  skipPush?: boolean;
  channelId?: ChannelId;
  priority?: "default" | "high";
  ttl?: number;
};

const resolveChannel = (type: NotificationType): ChannelId => {
  if (type === "INCOMING_CALL") return "incoming-calls";
  if (type === "MISSED_CALL" || type === "CALL_ENDED" || type === "call_missed" || type === "call_ended") {
    return "calls";
  }
  if (type === "INCIDENT_CREATED" || type === "incident_created") return "incidents";
  return "default";
};

/**
 * Persist a notification, broadcast it to the owner's socket room, and — when the user is not
 * currently connected (or when forcePush is set) — deliver it as an Expo push notification.
 */
export const publishNotification = async (input: RealtimeNotificationInput) => {
  const channelId = input.channelId ?? resolveChannel(input.type);
  let persisted: any = null;

  if (!input.skipPersist) {
    try {
      persisted = await NotificationModel.create({
        userId: input.userId,
        type: input.type,
        title: input.title,
        body: input.body,
        message: input.body,
        data: input.data ?? {},
        relatedEntityId: input.relatedEntityId ?? "",
        isRead: false,
        readStatus: false
      });
    } catch (err) {
      logger.warn("notification.persist_failed", { err: (err as Error).message, type: input.type });
    }
  }

  const payload = {
    id: persisted?._id ? String(persisted._id) : undefined,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
    relatedEntityId: input.relatedEntityId ?? "",
    createdAt: persisted?.createdAt ?? new Date().toISOString()
  };

  // Socket broadcast (both new and legacy event names for backward compat)
  emitToUser(input.userId, "notification:new", payload);
  emitToUser(input.userId, "notification_new", payload);

  const online = isUserOnline(input.userId);
  const shouldPush = input.forcePush ?? !online;
  if (shouldPush && !input.skipPush) {
    await sendPushToUser(input.userId, {
      title: input.title,
      body: input.body,
      data: { ...(input.data ?? {}), notificationId: payload.id, type: input.type },
      channelId,
      priority: input.priority ?? (channelId === "incoming-calls" || channelId === "calls" ? "high" : "default"),
      ttl: input.ttl
    });
  }

  return payload;
};
