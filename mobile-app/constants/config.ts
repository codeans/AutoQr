import Constants from "expo-constants";

type Extra = {
  apiBaseUrl?: string;
  socketUrl?: string;
  assetsBaseUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const PRODUCTION_HOST = "https://api.autoqr.de";
const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? process.env.EXPO_PUBLIC_API_BASE_URL ?? extra.apiBaseUrl ?? PRODUCTION_HOST;
const apiBaseUrl = rawApiUrl.replace(/\/$/, "").endsWith("/api")
  ? rawApiUrl.replace(/\/$/, "")
  : `${rawApiUrl.replace(/\/$/, "")}/api`;

export const config = {
  apiBaseUrl,
  socketUrl: process.env.EXPO_PUBLIC_SOCKET_URL ?? extra.socketUrl ?? PRODUCTION_HOST,
  assetsBaseUrl: process.env.EXPO_PUBLIC_ASSETS_BASE_URL ?? extra.assetsBaseUrl ?? PRODUCTION_HOST,
  appName: "AutoQr"
} as const;

export function resolveAssetUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const base = config.assetsBaseUrl.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
