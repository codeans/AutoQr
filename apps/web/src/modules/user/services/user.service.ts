import { api } from "../../../lib/api";
import { UserCall, UserCar, UserIncident, UserNotification, UserOrder, UserProfile, UserSummary } from "../types/user.types";

export const userService = {
  getDashboard: async () => (await api.get<{ summary: UserSummary; incidents: UserIncident[]; calls: UserCall[]; orders: UserOrder[] }>("/owner/dashboard")).data,
  getCars: async () => (await api.get<{ cars: UserCar[] }>("/owner/cars")).data,
  getIncidents: async () => (await api.get<{ incidents: UserIncident[] }>("/owner/incidents")).data,
  getIncidentDetail: async (id: string) => (await api.get<{ incident: UserIncident; calls: UserCall[] }>(`/owner/incidents/${id}`)).data,
  getCalls: async () => (await api.get<{ calls: UserCall[] }>("/owner/calls")).data,
  getOrders: async () => (await api.get<{ orders: UserOrder[] }>("/owner/orders")).data,
  createCheckout: async (orderId: string) => (await api.post<{ url?: string }>("/payments/checkout", { orderId })).data,
  getNotifications: async () => (await api.get<{ notifications: UserNotification[] }>("/owner/notifications")).data,
  getProfile: async () => (await api.get<{ user: UserProfile }>("/owner/profile")).data,
  updateProfile: async (payload: Partial<UserProfile>) => (await api.put<{ user: UserProfile }>("/owner/profile", payload)).data
};
