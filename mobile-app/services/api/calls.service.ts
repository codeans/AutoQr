import { apiClient } from "./client";

export type CallStatus =
  | "ringing"
  | "accepted"
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

export const callsService = {
  list: () => apiClient.get<{ calls: CallHistoryItem[] }>("/owner/calls"),
  get: (callId: string) => apiClient.get<{ call: import("@/types/call").IncomingCall }>(`/calls/${callId}`)
};
