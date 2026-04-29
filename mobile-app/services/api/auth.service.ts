import { apiClient, clearAuthTokens, setAuthTokens } from "./client";
import type { User } from "@/types/domain";

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: User;
};

export async function login(params: { email: string; password: string }): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login", params, { skipAuth: true });
  await setAuthTokens({
    accessToken: res.accessToken,
    ...(res.refreshToken ? { refreshToken: res.refreshToken } : {})
  });
  return res;
}

export async function loginWithFirebaseOtp(params: {
  phone: string;
  idToken: string;
  signup?: { name: string; email: string; address: string };
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/login/firebase-otp", params, { skipAuth: true });
  await setAuthTokens({
    accessToken: res.accessToken,
    ...(res.refreshToken ? { refreshToken: res.refreshToken } : {})
  });
  return res;
}

export async function sendWhatsAppOtp(params: { phone: string; purpose: "login" | "signup" }): Promise<{ devCode?: string; expiresInSeconds: number }> {
  return apiClient.post<{ devCode?: string; expiresInSeconds: number }>(`/auth/send-whatsapp-otp`, params, { skipAuth: true });
}

export async function verifyWhatsAppOtp(params: {
  phone: string;
  code: string;
  purpose: "login" | "signup";
  signup?: { name: string; email: string; address: string; password: string };
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>(`/auth/verify-whatsapp-otp`, params, { skipAuth: true });
  await setAuthTokens({
    accessToken: res.accessToken,
    ...(res.refreshToken ? { refreshToken: res.refreshToken } : {})
  });
  return res;
}

export async function register(params: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
}): Promise<AuthResponse> {
  const res = await apiClient.post<AuthResponse>("/auth/register", params, { skipAuth: true });
  await setAuthTokens({
    accessToken: res.accessToken,
    ...(res.refreshToken ? { refreshToken: res.refreshToken } : {})
  });
  return res;
}

export async function fetchMe(): Promise<{ user: User }> {
  return apiClient.get<{ user: User }>("/auth/me");
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout", {});
  } catch {
    // ignore network errors on logout
  }
  await clearAuthTokens();
}

export async function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>("/auth/change-password", params);
}

export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>(
    "/auth/forgot-password",
    { email },
    { skipAuth: true }
  );
}

export async function resetPassword(params: {
  email: string;
  code: string;
  password: string;
}): Promise<{ message: string }> {
  return apiClient.post<{ message: string }>("/auth/reset-password", params, { skipAuth: true });
}
