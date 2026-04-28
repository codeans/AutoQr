export const CallEvents = {
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
  CALLBACK_INCOMING: "callback:incoming",
  CALLBACK_ACCEPTED: "callback:accepted",
  CALLBACK_DECLINED: "callback:declined",
  CALLBACK_MISSED: "callback:missed",
  CALLBACK_ENDED: "callback:ended"
} as const;

export type AgoraJoinPayload = {
  appId: string;
  token: string;
  channelName: string;
  uid: number;
  role: "publisher" | "subscriber";
  expiresAt: string;
  expiresInSeconds: number;
};

export type IncomingCall = {
  callId: string;
  incidentId: string;
  vehicleId?: string;
  vehiclePlate?: string;
  callerPhone?: string;
  incidentImages?: string[];
  ownerId?: string;
  status?: "ringing" | "accepted" | "declined" | "missed" | "ended" | "failed" | string;
  reporterSocketId: string;
  reporterPhone?: string;
  reporterName?: string;
  carId?: string;
  carLabel?: string;
  imageCount?: number;
  message?: string;
  platform?: "web" | "android" | "ios";
  createdAt?: string;
  expiresAt?: string;
  agoraChannelName?: string;
  agoraUidCaller?: number;
  agoraUidReceiver?: number;
};

export type ActiveCallState =
  | "idle"
  | "ringing"
  | "connecting"
  | "active"
  | "declined"
  | "missed"
  | "ended"
  | "failed";
