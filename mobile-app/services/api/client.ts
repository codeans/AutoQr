import { config } from "@/constants/config";
import { StorageKeys } from "@/constants/storage";
import { ApiError } from "@/utils/errors";
import { secureStorage } from "@/utils/secureStorage";

type RequestBody =
  | Record<string, unknown>
  | FormData
  | undefined
  | null;

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: RequestBody;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  skipAuth?: boolean;
  skipRefresh?: boolean;
  signal?: AbortSignal;
};

type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshInFlight: Promise<string | null> | null = null;
const tokenListeners = new Set<TokenListener>();

export async function hydrateTokensFromStorage(): Promise<void> {
  const [stored, storedRefresh] = await Promise.all([
    secureStorage.get(StorageKeys.accessToken),
    secureStorage.get(StorageKeys.refreshToken)
  ]);
  if (stored) accessToken = stored;
  if (storedRefresh) refreshToken = storedRefresh;
  notifyTokenListeners();
}

export function getAccessToken(): string | null {
  return accessToken;
}

export async function setAuthTokens(next: {
  accessToken?: string | null;
  refreshToken?: string | null;
}): Promise<void> {
  if (next.accessToken !== undefined) {
    accessToken = next.accessToken;
    if (next.accessToken) {
      await secureStorage.set(StorageKeys.accessToken, next.accessToken);
    } else {
      await secureStorage.remove(StorageKeys.accessToken);
    }
  }
  if (next.refreshToken !== undefined) {
    refreshToken = next.refreshToken;
    if (next.refreshToken) {
      await secureStorage.set(StorageKeys.refreshToken, next.refreshToken);
    } else {
      await secureStorage.remove(StorageKeys.refreshToken);
    }
  }
  notifyTokenListeners();
}

export async function clearAuthTokens(): Promise<void> {
  await setAuthTokens({ accessToken: null, refreshToken: null });
}

export function subscribeToAccessToken(listener: TokenListener): () => void {
  tokenListeners.add(listener);
  listener(accessToken);
  return () => {
    tokenListeners.delete(listener);
  };
}

function notifyTokenListeners(): void {
  tokenListeners.forEach((l) => l(accessToken));
}

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const base = config.apiBaseUrl.replace(/\/$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!query) return `${base}${p}`;
  const search = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    search.append(k, String(v));
  });
  const qs = search.toString();
  return qs ? `${base}${p}?${qs}` : `${base}${p}`;
}

async function parseResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (res.status === 204) return undefined as unknown as T;
  if (contentType.includes("application/json")) {
    return normalizeMongoIds(await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

function normalizeMongoIds<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeMongoIds(item)) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  const next: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(record)) {
    next[key] = normalizeMongoIds(entry);
  }

  if (typeof next._id === "string" && typeof next.id !== "string") {
    next.id = next._id;
  }

  return next as T;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {})
        },
        body: JSON.stringify({ refreshToken })
      });
      if (!res.ok) return null;
      const data = (await res.json().catch(() => null)) as
        | { accessToken?: string; refreshToken?: string }
        | null;
      if (data?.accessToken) {
        await setAuthTokens({
          accessToken: data.accessToken,
          ...(data.refreshToken ? { refreshToken: data.refreshToken } : {})
        });
        return data.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const isForm = typeof FormData !== "undefined" && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers
  };
  if (!isForm && options.body !== undefined && options.body !== null) {
    headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
  }
  if (!options.skipAuth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  try {
    // Lazy import to avoid bundling cycles
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const i18nModule = require("@/i18n");
    const lng = typeof i18nModule?.default?.language === "string" ? i18nModule.default.language : null;
    const locale = lng && lng.toLowerCase().startsWith("de") ? "de" : lng && lng.toLowerCase().startsWith("en") ? "en" : "de";
    headers["X-Locale"] = locale;
    headers["Accept-Language"] = locale;
  } catch {
    headers["X-Locale"] = "de";
    headers["Accept-Language"] = "de";
  }

  const body =
    options.body === undefined || options.body === null
      ? undefined
      : isForm
        ? (options.body as FormData)
        : JSON.stringify(options.body);

  const url = buildUrl(path, options.query);

  const res = await fetch(url, {
    method,
    headers,
    body,
    signal: options.signal
  });

  if (res.status === 401 && !options.skipAuth && !options.skipRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return request<T>(path, { ...options, skipRefresh: true });
    }
    await clearAuthTokens();
  }

  if (!res.ok) {
    const payload = await parseResponse<{ message?: string; details?: unknown }>(res).catch(
      () => null as never
    );
    const message =
      (payload && typeof payload === "object" && payload?.message) ||
      (res.status === 401 ? "Session expired. Please sign in again." : "Request failed");
    throw new ApiError(message, res.status, payload?.details);
  }

  return parseResponse<T>(res);
}

export const apiClient = {
  get: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: RequestBody, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  put: <T>(path: string, body?: RequestBody, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PUT", body }),
  patch: <T>(path: string, body?: RequestBody, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "PATCH", body }),
  delete: <T>(path: string, opts?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...opts, method: "DELETE" })
};
