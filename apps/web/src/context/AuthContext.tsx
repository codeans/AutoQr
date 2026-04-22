import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, registerAccessTokenListener, setAccessToken } from "../lib/api";

type User = {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "owner" | "support";
  phone?: string;
  phoneVerified?: boolean;
} | null;

export type OtpVerifyPayload = {
  phone: string;
  code: string;
  purpose?: "login" | "signup" | "phone_verify" | "activation";
  signup?: { name: string; email: string; address: string };
};

type AuthContextShape = {
  user: User;
  token: string;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  requestOtp: (phone: string, purpose?: OtpVerifyPayload["purpose"]) => Promise<{ devCode?: string; expiresInSeconds: number }>;
  verifyOtp: (payload: OtpVerifyPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | null>(null);

const persist = (user: User, token: string) => {
  if (user) localStorage.setItem("autoqr_user", JSON.stringify(user));
  else localStorage.removeItem("autoqr_user");
  if (token) localStorage.setItem("autoqr_access", token);
  else localStorage.removeItem("autoqr_access");
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    const raw = localStorage.getItem("autoqr_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("autoqr_access") ?? "");
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    if (token) setAccessToken(token);
  }, [token]);

  useEffect(() => {
    registerAccessTokenListener((nextToken) => {
      setToken(nextToken);
      if (!nextToken) {
        setUser(null);
        persist(null, "");
      } else {
        localStorage.setItem("autoqr_access", nextToken);
      }
    });
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("autoqr_user", JSON.stringify(data.user));
      } catch {
        setToken("");
        setAccessToken("");
        setUser(null);
        persist(null, "");
      } finally {
        setIsBootstrapping(false);
      }
    };
    bootstrap().catch(() => setIsBootstrapping(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.accessToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    persist(data.user, data.accessToken);
  };

  const requestOtp = useCallback(async (phone: string, purpose: OtpVerifyPayload["purpose"] = "login") => {
    const { data } = await api.post("/auth/otp/request", { phone, purpose });
    return { devCode: data.devCode, expiresInSeconds: data.expiresInSeconds };
  }, []);

  const verifyOtp = useCallback(async (payload: OtpVerifyPayload) => {
    const { data } = await api.post("/auth/otp/verify", payload);
    setToken(data.accessToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
    persist(data.user, data.accessToken);
    return data.user as User;
  }, []);

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setToken("");
    setAccessToken("");
    setUser(null);
    persist(null, "");
  };

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
      persist(data.user, token);
    } catch {
      /* ignore */
    }
  }, [token]);

  const value = useMemo(
    () => ({ user, token, isBootstrapping, login, logout, requestOtp, verifyOtp, refreshUser }),
    [user, token, isBootstrapping, requestOtp, verifyOtp, refreshUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
