import { create } from "zustand";
import type { User } from "@/types/domain";

type AuthStatus = "booting" | "authenticated" | "unauthenticated";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  reset: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  status: "booting",
  user: null,
  setUser: (user) => set({ user, status: user ? "authenticated" : "unauthenticated" }),
  setStatus: (status) => set({ status }),
  reset: () => set({ user: null, status: "unauthenticated" })
}));
