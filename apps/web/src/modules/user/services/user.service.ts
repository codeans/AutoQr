import { api } from "../../../lib/api";
import { UserCall, UserCallback, UserCar, UserIncident, UserNotification, UserOrder, UserProfile, UserSummary } from "../types/user.types";

export const userService = {
  getDashboard: async () => (await api.get<{ summary: UserSummary; incidents: UserIncident[]; calls: UserCall[]; orders: UserOrder[] }>("/owner/dashboard")).data,
  getCars: async () => (await api.get<{ cars: UserCar[] }>("/owner/cars")).data,
  getIncidents: async () => (await api.get<{ incidents: UserIncident[] }>("/owner/incidents")).data,
  getIncidentDetail: async (id: string) => (await api.get<{ incident: UserIncident; calls: UserCall[] }>(`/owner/incidents/${id}`)).data,
  getCalls: async () => (await api.get<{ calls: UserCall[] }>("/owner/calls")).data,
  getCallbacks: async (status?: string) =>
    (await api.get<{ callbacks: UserCallback[] }>(`/callbacks/history${status ? `?status=${status}` : ""}`)).data,
  requestCallback: async (incidentId: string, notes?: string) =>
    (await api.post<{ callback: UserCallback }>("/callbacks/request", { incidentId, notes })).data,
  startCallback: async (callbackId: string) =>
    (await api.post<{ callback: UserCallback; callId?: string }>("/callbacks/start", { callbackId })).data,
  endCallback: async (
    callbackId: string,
    callbackStatus: "completed" | "declined" | "missed" | "failed" = "completed"
  ) => (await api.post<{ callback: UserCallback }>("/callbacks/end", { callbackId, callbackStatus })).data,
  getOrders: async () => (await api.get<{ orders: UserOrder[] }>("/owner/orders")).data,
  createCheckout: async (orderId: string) => (await api.post<{ url?: string }>("/payments/checkout", { orderId })).data,
  getNotifications: async () => (await api.get<{ notifications: UserNotification[] }>("/owner/notifications")).data,
  getProfile: async () => (await api.get<{ user: UserProfile }>("/owner/profile")).data,
  updateProfile: async (payload: Partial<UserProfile>) => (await api.put<{ user: UserProfile }>("/owner/profile", payload)).data,
  updateLanguage: async (preferredLanguage: "de" | "en") =>
    (await api.put<{ user: UserProfile }>("/owner/language", { preferredLanguage })).data
};
