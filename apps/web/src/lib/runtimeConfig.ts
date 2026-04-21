const isProd = import.meta.env.PROD;

const getEnv = (name: "VITE_API_URL" | "VITE_SOCKET_URL", fallbackForDev: string) => {
  const value = import.meta.env[name];
  if (value && typeof value === "string") return value;
  if (!isProd) return fallbackForDev;
  throw new Error(`Missing required environment variable: ${name}`);
};

export const apiBaseUrl = getEnv("VITE_API_URL", "http://localhost:4000/api").replace(/\/$/, "");
export const socketBaseUrl = getEnv("VITE_SOCKET_URL", "http://localhost:4000").replace(/\/$/, "");
export const assetBaseUrl = apiBaseUrl.replace(/\/api$/, "");

const parseIceServers = () => {
  const fromEnv = import.meta.env.VITE_WEBRTC_ICE_SERVERS;
  if (!fromEnv) {
    return [{ urls: "stun:stun.l.google.com:19302" }];
  }
  try {
    const parsed = JSON.parse(fromEnv);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("VITE_WEBRTC_ICE_SERVERS must be a non-empty JSON array");
    }
    return parsed;
  } catch (error) {
    throw new Error(
      `Invalid VITE_WEBRTC_ICE_SERVERS value: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const webRtcIceServers = parseIceServers();
