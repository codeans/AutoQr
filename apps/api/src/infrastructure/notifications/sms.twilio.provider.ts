import twilio from "twilio";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { registerNotificationProvider, type NotificationProvider } from "./notification.provider.js";

class TwilioSmsProvider implements NotificationProvider {
  readonly channel = "sms" as const;
  private readonly client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);

  async send(payload: { to: string; body: string }) {
    try {
      const sent = await this.client.messages.create({
        to: payload.to,
        from: env.TWILIO_SMS_FROM,
        body: payload.body
      });
      return {
        channel: this.channel,
        success: true,
        providerRef: sent.sid
      };
    } catch (err: any) {
      logger.error("notification.sms.twilio_failed", {
        to: payload.to,
        error: err?.message ?? "Unknown Twilio error"
      });
      return {
        channel: this.channel,
        success: false,
        error: err?.message ?? "SMS send failed"
      };
    }
  }
}

const hasTwilioConfig = Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_SMS_FROM);

export const registerSmsProvider = () => {
  if (!hasTwilioConfig) {
    logger.warn("notification.sms.twilio_not_configured", {
      configured: false
    });
    return;
  }
  registerNotificationProvider(new TwilioSmsProvider());
  logger.info("notification.sms.twilio_registered");
};
