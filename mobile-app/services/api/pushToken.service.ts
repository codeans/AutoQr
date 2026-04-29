import { request } from "./client";

export type PushPlatform = "ios" | "android" | "web";
export type PushTokenType = "expo" | "fcm" | "voip";

export const pushTokenService = {
  register: (params: { token: string; platform: PushPlatform; tokenType?: PushTokenType; deviceId?: string; appVersion?: string }) =>
    request<{ ok: boolean }>("/mobile/push-token", { method: "POST", body: params }),
  registerFcmToken: (params: { token: string; platform?: "android"; deviceId?: string; appVersion?: string; enabled?: boolean }) =>
    request<{ ok: boolean }>("/mobile/fcm-token", { method: "POST", body: params }),
  unregisterFcmToken: (token: string) =>
    request<{ ok: boolean }>("/mobile/fcm-token", { method: "DELETE", body: { token } }),
  unregister: (token: string) =>
    request<{ ok: boolean }>("/mobile/push-token", { method: "DELETE", body: { token } })
};
