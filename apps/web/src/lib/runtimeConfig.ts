const isProd = import.meta.env.PROD;

const getEnv = (name: "VITE_API_URL" | "VITE_SOCKET_URL" | "VITE_AGORA_APP_ID", fallbackForDev: string) => {
  const value = import.meta.env[name];
  if (value && typeof value === "string") return value;
  if (!isProd) return fallbackForDev;
  throw new Error(`Missing required environment variable: ${name}`);
};

export const apiBaseUrl = getEnv("VITE_API_URL", "https://api.autoqr.de/api").replace(/\/$/, "");
export const socketBaseUrl = getEnv("VITE_SOCKET_URL", "https://api.autoqr.de").replace(/\/$/, "");
export const assetBaseUrl = apiBaseUrl.replace(/\/api$/, "");
export const agoraAppId = getEnv("VITE_AGORA_APP_ID", "").trim();
