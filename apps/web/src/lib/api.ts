import axios from "axios";
import { apiBaseUrl } from "./runtimeConfig";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

let accessToken = "";
let onTokenRefreshed: ((token: string) => void) | null = null;
let refreshPromise: Promise<string> | null = null;

const refreshClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true
});

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const registerAccessTokenListener = (listener: (token: string) => void) => {
  onTokenRefreshed = listener;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as { _retry?: boolean; url?: string; headers?: Record<string, string> };
    const requestUrl = original?.url ?? "";
    const isRefreshRequest = requestUrl.includes("/auth/refresh");
    const isLoginRequest = requestUrl.includes("/auth/login");
    if (error.response?.status === 401 && !original?._retry && !isRefreshRequest && !isLoginRequest) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post("/auth/refresh")
          .then((refreshRes) => {
            const token = refreshRes.data.accessToken as string;
            setAccessToken(token);
            onTokenRefreshed?.(token);
            return token;
          })
          .catch((refreshError) => {
            setAccessToken("");
            onTokenRefreshed?.("");
            throw refreshError;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const refreshedToken = await refreshPromise;
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${refreshedToken}`;
      return api.request(original);
    }
    throw error;
  }
);
