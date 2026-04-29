import { apiClient } from "./client";

export type CallStatus =
  | "ringing"
  | "accepted"
  | "active"
  | "connected"
  | "ended"
  | "missed"
  | "declined"
  | "rejected"
  | "failed"
  | "cancelled";

export type CallHistoryItem = {
  _id: string;
  incidentId: string;
  ownerUserId: string;
  reporterPhoneMasked: string;
  status: CallStatus;
  startedAt?: string;
  endedAt?: string;
  duration?: number;
  endReason?: string;
  rejectionReason?: string;
  reporterPlatform?: string;
  ownerPlatform?: string;
  createdAt: string;
  updatedAt: string;
};

type CallMutationResponse = {
  ok: boolean;
  call: {
    callId: string;
    incidentId?: string;
    status: CallStatus | string;
    reason?: string;
    ownerSocketId?: string;
    reporterSocketId?: string;
    agora?: import("@/types/call").AgoraJoinPayload;
  };
};

export const callsService = {
  list: () => apiClient.get<{ calls: CallHistoryItem[] }>("/owner/calls"),
  get: (callId: string) => apiClient.get<{ call: import("@/types/call").IncomingCall }>(`/calls/${callId}`),
  recoverActive: () => apiClient.get<{ ok: boolean; call: import("@/types/call").IncomingCall | null }>("/calls/active/recover"),
  token: (payload: { callId: string; channelName?: string; uid?: number; role?: "publisher" | "subscriber" }) =>
    apiClient.post<{ ok: boolean; agora: import("@/types/call").AgoraJoinPayload }>("/agora/token", payload),
  accept: (callId: string, platform: "ios" | "android" | "web", ownerSocketId?: string) =>
    apiClient.post<CallMutationResponse>(`/calls/${callId}/accept`, { platform, ownerSocketId }),
  decline: (callId: string, reason?: string) =>
    apiClient.post<CallMutationResponse>(`/calls/${callId}/decline`, reason ? { reason } : {}),
  missed: (callId: string, reason = "timeout") =>
    apiClient.post<CallMutationResponse>(`/calls/${callId}/missed`, { reason }),
  end: (callId: string, reason = "owner_ended") =>
    apiClient.post<CallMutationResponse>("/calls/end", { callId, reason })
};
