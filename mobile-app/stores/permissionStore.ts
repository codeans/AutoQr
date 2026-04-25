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
      hydrated: false,
      setStatus: (permission, status) =>
        set((state) => ({ statuses: { ...state.statuses, [permission]: status } })),
      setStatuses: (next) => set((state) => ({ statuses: { ...state.statuses, ...next } })),
      setOnboardingSeen: (seen) => set({ onboardingSeen: seen }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      setHydrated: (hydrated) => set({ hydrated }),
      reset: () =>
        set({
          statuses: initialStatuses,
          onboardingSeen: false,
          onboardingCompleted: false
        })
    }),
    {
      name: "autoqr.permissions.v1",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        statuses: state.statuses,
        onboardingSeen: state.onboardingSeen,
        onboardingCompleted: state.onboardingCompleted
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      }
    }
  )
);
