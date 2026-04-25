import { request } from "./client";

export type PushPlatform = "ios" | "android" | "web";

export const pushTokenService = {
  register: (params: { token: string; platform: PushPlatform; deviceId?: string; appVersion?: string }) =>
    request<{ ok: boolean }>("/mobile/push-token", { method: "POST", body: params }),
  unregister: (token: string) =>
    request<{ ok: boolean }>("/mobile/push-token", { method: "DELETE", body: { token } })
};
