import { logger } from "../../utils/logger.js";

export type MaskedCallRequest = {
  callerPhone: string;
  calleePhone: string;
  contextId?: string;
  purpose?: string;
};

export type MaskedCallSession = {
  sessionId: string;
  provider: string;
  maskedNumberForCaller?: string;
  expiresAt: Date;
  status: "initiated" | "connected" | "ended" | "failed";
};

export interface TelephonyProvider {
  readonly name: string;
  initiateMaskedCall(request: MaskedCallRequest): Promise<MaskedCallSession>;
  endCall(sessionId: string): Promise<void>;
}

class LocalTelephonyProvider implements TelephonyProvider {
  readonly name = "agora-voice";
  async initiateMaskedCall(request: MaskedCallRequest): Promise<MaskedCallSession> {
    const sessionId = `maskedcall-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    logger.info("telephony.masked_call.initiated", { sessionId, contextId: request.contextId });
    return {
      sessionId,
      provider: this.name,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      status: "initiated"
    };
  }
  async endCall(sessionId: string): Promise<void> {
    logger.info("telephony.masked_call.ended", { sessionId });
  }
}

let provider: TelephonyProvider = new LocalTelephonyProvider();

export const registerTelephonyProvider = (p: TelephonyProvider) => {
  provider = p;
};

export const getTelephonyProvider = (): TelephonyProvider => provider;
