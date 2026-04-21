import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, registerAccessTokenListener, setAccessToken } from "../lib/api";

type User = { _id: string; name: string; email: string; role: "admin" | "owner" } | null;
type AuthContextShape = {
  user: User;
  token: string;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextShape | null>(null);

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
      if (nextToken) {
        localStorage.setItem("autoqr_access", nextToken);
      } else {
        setUser(null);
        localStorage.removeItem("autoqr_access");
        localStorage.removeItem("autoqr_user");
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
        localStorage.removeItem("autoqr_access");
        localStorage.removeItem("autoqr_user");
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
    localStorage.setItem("autoqr_access", data.accessToken);
    localStorage.setItem("autoqr_user", JSON.stringify(data.user));
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setToken("");
    setAccessToken("");
    setUser(null);
    localStorage.removeItem("autoqr_access");
    localStorage.removeItem("autoqr_user");
  };

  const value = useMemo(() => ({ user, token, isBootstrapping, login, logout }), [user, token, isBootstrapping]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
