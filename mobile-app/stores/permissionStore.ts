import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PermissionState, PermissionStatusMap, TrackedPermission } from "@/services/permissions/types";

const initialStatuses: PermissionStatusMap = {
  notifications: "unknown",
  microphone: "unknown",
  camera: "unknown",
  mediaLibrary: "unknown",
  storage: "unknown",
  backgroundRefresh: "unknown",
  network: "unknown"
};

type PermissionStore = {
  statuses: PermissionStatusMap;
  onboardingSeen: boolean;
  onboardingCompleted: boolean;
  hasCompletedPermissionOnboarding: boolean;
  lastCheckedAt: number | null;
  hydrated: boolean;
  setStatus: (permission: TrackedPermission, status: PermissionState) => void;
  setStatuses: (next: Partial<PermissionStatusMap>) => void;
  setOnboardingSeen: (seen: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  reset: () => void;
};

export const usePermissionStore = create<PermissionStore>()(
  persist(
    (set) => ({
      statuses: initialStatuses,
      onboardingSeen: false,
      onboardingCompleted: false,
      hasCompletedPermissionOnboarding: false,
      lastCheckedAt: null,
      hydrated: false,
      setStatus: (permission, status) =>
        set((state) => ({
          statuses: { ...state.statuses, [permission]: status },
          lastCheckedAt: Date.now()
        })),
      setStatuses: (next) =>
        set((state) => ({
          statuses: { ...state.statuses, ...next },
          lastCheckedAt: Date.now()
        })),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
      setOnboardingCompleted: (completed) =>
        set({ onboardingCompleted: completed, hasCompletedPermissionOnboarding: completed }),
      setHydrated: (hydrated) => set({ hydrated }),
      reset: () =>
        set({
          statuses: initialStatuses,
          onboardingSeen: false,
          onboardingCompleted: false,
          hasCompletedPermissionOnboarding: false,
          lastCheckedAt: null
        })
    }),
    {
      name: "autoqr.permissions.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        statuses: state.statuses,
        onboardingSeen: state.onboardingSeen,
        onboardingCompleted: state.onboardingCompleted,
        hasCompletedPermissionOnboarding: state.hasCompletedPermissionOnboarding,
        lastCheckedAt: state.lastCheckedAt
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.hasCompletedPermissionOnboarding === undefined) {
          state.setOnboardingCompleted(Boolean(state.onboardingCompleted));
        }
        state?.setHydrated(true);
      }
    }
  )
);
