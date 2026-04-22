import { logger } from "../../utils/logger.js";

export type NotificationChannel = "sms" | "whatsapp" | "push" | "email" | "in_app";

export type NotificationPayload = {
  to: string;
  subject?: string;
  body: string;
  data?: Record<string, unknown>;
};

export type NotificationResult = {
  channel: NotificationChannel;
  success: boolean;
  providerRef?: string;
  error?: string;
  skipped?: boolean;
};

export interface NotificationProvider {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}

class ConsoleProvider implements NotificationProvider {
  constructor(public readonly channel: NotificationChannel) {}
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    logger.info(`[notification:${this.channel}] outbound`, {
      to: payload.to,
      subject: payload.subject ?? "",
      body: payload.body.slice(0, 200)
    });
    return {
      channel: this.channel,
      success: true,
      providerRef: `console-${Date.now()}`
    };
  }
}

const providers = new Map<NotificationChannel, NotificationProvider>();

export const registerNotificationProvider = (provider: NotificationProvider) => {
  providers.set(provider.channel, provider);
};

export const getNotificationProvider = (channel: NotificationChannel): NotificationProvider => {
  const p = providers.get(channel);
  if (p) return p;
  const fallback = new ConsoleProvider(channel);
  providers.set(channel, fallback);
  return fallback;
};
