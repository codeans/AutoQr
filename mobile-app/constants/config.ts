import Constants from "expo-constants";

type Extra = {
  apiBaseUrl?: string;
  socketUrl?: string;
  assetsBaseUrl?: string;
  webRtcIceServers?: unknown;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;
type IceServer = { urls: string | string[]; username?: string; credential?: string };

const PRODUCTION_HOST = "https://api.autoqr.de";
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? PRODUCTION_HOST;
const apiBaseUrl = rawApiUrl.replace(/\/$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/$/, "")
  : `${rawApiUrl.replace(/\/$/, "")}/api`;

export const config = {
  apiBaseUrl,
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? extra.socketUrl ?? PRODUCTION_HOST,
  assetsBaseUrl: process.env.EXPO_PUBLIC_ASSETS_BASE_URL ?? extra.assetsBaseUrl ?? PRODUCTION_HOST,
  webRtcIceServers: parseIceServers(process.env.EXPO_PUBLIC_WEBRTC_ICE_SERVERS ?? extra.webRtcIceServers),
  appName: "AutoQr"
} as const;

function parseIceServers(value: unknown): IceServer[] {
  if (!value) return [{ urls: "stun:stun.l.google.com:19302" }];
  if (Array.isArray(value)) return value as IceServer[];
  if (typeof value !== "string") return [{ urls: "stun:stun.l.google.com:19302" }];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as IceServer[]) : [{ urls: "stun:stun.l.google.com:19302" }];
  } catch {
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }
}

export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = config.assetsBaseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
