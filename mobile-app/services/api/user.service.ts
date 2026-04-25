import { apiClient } from "./client";
import type { EmergencyContact, Notification, User } from "@/types/domain";

export async function getProfile(): Promise<User> {
  const res = await apiClient.get<{ user: User }>("/owner/profile");
  return res.user;
}

export async function updateProfile(input: {
  name?: string;
  phone?: string;
  address?: string;
  preferredLanguage?: "de" | "en";
  notificationPreferences?: { email?: boolean; inApp?: boolean };
}): Promise<User> {
  const res = await apiClient.put<{ user: User }>("/owner/profile", input);
  return res.user;
}

export async function updateLanguage(preferredLanguage: "de" | "en"): Promise<User> {
  const res = await apiClient.put<{ user: User }>("/owner/language", { preferredLanguage });
  return res.user;
}

export async function listNotifications(): Promise<Notification[]> {
  const res = await apiClient.get<{ notifications: Notification[] }>("/owner/notifications");
  return res.notifications ?? [];
}

export async function listEmergencyContacts(): Promise<EmergencyContact[]> {
  const res = await apiClient.get<{ contacts: EmergencyContact[] }>("/owner/emergency-contacts");
  return res.contacts ?? [];
}

export async function getDashboard(): Promise<{
  summary: Record<string, number>;
  incidents: unknown[];
  calls: unknown[];
  orders: unknown[];
  payments: unknown[];
}> {
  return apiClient.get("/owner/dashboard");
}
