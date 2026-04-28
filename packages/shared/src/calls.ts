export const CallState = {
  IDLE: "idle",
  CONNECTING: "connecting",
  RINGING: "ringing",
  INCOMING: "incoming",
  ACCEPTED: "accepted",
  CONNECTED: "connected",
  REJECTED: "rejected",
  MISSED: "missed",
  ENDED: "ended",
  FAILED: "failed",
  PERMISSION_DENIED: "permission_denied"
} as const;

export type CallStateValue = (typeof CallState)[keyof typeof CallState];

export const CallPlatform = {
  WEB: "web",
  ANDROID: "android",
  IOS: "ios"
} as const;

export type CallPlatformValue = (typeof CallPlatform)[keyof typeof CallPlatform];

export const CallEndReason = {
  OWNER_ENDED: "owner_ended",
  REPORTER_ENDED: "reporter_ended",
  TIMEOUT: "timeout",
  DISCONNECT: "disconnect",
  PERMISSION_DENIED: "permission_denied",
  OWNER_OFFLINE: "owner_offline",
  NETWORK_ERROR: "network_error"
} as const;

export type CallEndReasonValue = (typeof CallEndReason)[keyof typeof CallEndReason];

export const SocketCallEvent = {
  CALL_REQUESTED: "call_requested",
  CALL_INCOMING: "call:incoming",
  CALL_RINGING: "call_ringing",
  CALL_ACCEPT: "call_accept",
  CALL_ACCEPTED: "call_accepted",
  CALL_REJECT: "call_reject",
  CALL_REJECTED: "call_rejected",
  CALL_STARTED: "call_started",
  CALL_END: "call_end",
  CALL_ENDED: "call_ended",
  CALL_MISSED: "call_missed",
  CALL_CANCELLED: "call_cancelled",
  CALL_RECONNECT: "call_reconnect",
  CALLBACK_INCOMING: "callback:incoming",
  CALLBACK_ACCEPTED: "callback:accepted",
  CALLBACK_DECLINED: "callback:declined",
  CALLBACK_MISSED: "callback:missed",
  CALLBACK_ENDED: "callback:ended"
} as const;

export const CallbackStatus = {
  PENDING: "pending",
  CALLING: "calling",
  CONNECTED: "connected",
  DECLINED: "declined",
  MISSED: "missed",
  COMPLETED: "completed",
  FAILED: "failed"
} as const;

export type CallbackStatusValue = (typeof CallbackStatus)[keyof typeof CallbackStatus];

export type CallbackSession = {
  _id: string;
  incidentId: string;
  vehicleId?: string;
  ownerId: string;
  reporterPhoneMasked?: string;
  callbackStatus: CallbackStatusValue;
  callbackStartedAt?: string;
  callbackEndedAt?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type IncomingCallNotification = {
  callId: string;
  incidentId: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  incidentImages?: string[];
  ownerId?: string;
  status?: string;
  reporterSocketId: string;
  reporterPhone?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: CallPlatformValue;
  createdAt?: string;
};
