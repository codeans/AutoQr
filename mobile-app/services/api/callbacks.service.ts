import { apiClient } from "./client";
import type { CallbackSession } from "@/types/domain";

export const callbacksService = {
  history: (status?: string) =>
    apiClient.get<{ callbacks: CallbackSession[] }>(`/callbacks/history${status ? `?status=${status}` : ""}`),
  request: (incidentId: string, notes?: string) =>
    apiClient.post<{ callback: CallbackSession }>("/callbacks/request", { incidentId, notes }),
  start: (callbackId: string) =>
    apiClient.post<{ callback: CallbackSession; callId?: string }>("/callbacks/start", { callbackId }),
  end: (callbackId: string, callbackStatus: "completed" | "declined" | "missed" | "failed" = "completed") =>
    apiClient.post<{ callback: CallbackSession }>("/callbacks/end", { callbackId, callbackStatus }),
  get: (id: string) => apiClient.get<{ callback: CallbackSession }>(`/callbacks/${id}`)
};
