import { logger } from "../../utils/logger.js";
import { UserModel } from "../../models/User.js";

const EXPO_PUSH_ENDPOINT = "https://exp.host/--/api/v2/push/send";
const MAX_BATCH = 100;

export type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | string | null;
  channelId?: "incoming-calls" | "calls" | "incidents" | "default";
  priority?: "default" | "high";
  ttl?: number;
  categoryId?: string;
};

type ExpoPushTicket = {
  status: "ok" | "error";
  id?: string;
  message?: string;
  details?: { error?: string };
};

type ExpoPushResponse = { data?: ExpoPushTicket[] };

const isExpoPushToken = (token: string) =>
  typeof token === "string" && (token.startsWith("ExponentPushToken[") || token.startsWith("ExpoPushToken["));

const chunk = <T,>(items: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

export const sendExpoPush = async (messages: ExpoPushMessage[]): Promise<ExpoPushTicket[]> => {
  const valid = messages.filter((m) => isExpoPushToken(m.to));
  if (valid.length === 0) return [];
  const tickets: ExpoPushTicket[] = [];
  for (const batch of chunk(valid, MAX_BATCH)) {
    try {
      const res = await fetch(EXPO_PUSH_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip, deflate",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(batch)
      });
      if (!res.ok) {
        logger.warn("expo_push.http_error", { status: res.status });
        tickets.push(...batch.map((): ExpoPushTicket => ({ status: "error", message: `HTTP ${res.status}` })));
        continue;
      }
      const json = (await res.json()) as ExpoPushResponse;
      if (Array.isArray(json.data)) tickets.push(...json.data);
    } catch (err) {
      logger.warn("expo_push.fetch_failed", { err: (err as Error).message });
      tickets.push(...batch.map((): ExpoPushTicket => ({ status: "error", message: (err as Error).message })));
    }
  }
  return tickets;
};

/**
 * Send a push notification to every registered device of the given user. Invalid or expired
 * tokens are pruned best-effort so we don't keep hitting them.
 */
export const sendPushToUser = async (
  userId: string,
  params: Omit<ExpoPushMessage, "to">
): Promise<void> => {
  try {
    const user = await UserModel.findById(userId).select("pushTokens notificationPreferences").lean();
    if (!user) return;
    if (user.notificationPreferences?.push === false) return;
    const tokens: string[] = Array.isArray(user.pushTokens)
      ? user.pushTokens
          .filter((t: any) => t?.tokenType === "expo")
          .map((t: any) => t?.token)
          .filter((t: unknown): t is string => typeof t === "string" && t.length > 0)
      : [];
    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens.map((token) => ({
      to: token,
      title: params.title,
      body: params.body,
      data: params.data,
      sound: params.sound ?? (params.channelId === "incoming-calls" ? "autoqr_incoming_call.mp3" : "default"),
      channelId: params.channelId ?? "default",
      priority: params.priority ?? "high",
      ttl: params.ttl
    }));

    const tickets = await sendExpoPush(messages);
    logger.info("expo_push.sent", {
      userId,
      tokenCount: tokens.length,
      ticketCount: tickets.length,
      channelId: params.channelId ?? "default"
    });

    // Prune tokens that Expo says are dead
    const invalidTokens: string[] = [];
    tickets.forEach((ticket, idx) => {
      if (ticket.status === "error") {
        const code = ticket.details?.error;
        if (code === "DeviceNotRegistered" || code === "InvalidCredentials") {
          invalidTokens.push(tokens[idx]);
        }
      }
    });
    if (invalidTokens.length > 0) {
      await UserModel.updateOne(
        { _id: userId },
        { $pull: { pushTokens: { token: { $in: invalidTokens } } } }
      );
      logger.info("expo_push.tokens_pruned", { userId, count: invalidTokens.length });
    }
  } catch (err) {
    logger.warn("expo_push.send_failed", { userId, err: (err as Error).message });
  }
};
