import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthApi } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { useCallStore } from "@/stores/call.store";
import { useNotificationStore } from "@/stores/notification.store";
import { disconnectSocket } from "@/services/socket/socket";
import { unregisterPushTokenForCurrentDevice, setBadgeCount } from "@/services/notifications/notifications";
import { agoraVoiceService } from "@/services/agora/agoraVoiceService";
import { nativeCallService } from "@/services/calls/nativeCallService";

export function useAuthActions() {
  const setUser = useAuthStore((s) => s.setUser);
  const resetAuth = useAuthStore((s) => s.reset);
  const resetCall = useCallStore((s) => s.reset);
  const qc = useQueryClient();

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await AuthApi.login({ email, password });
      setUser(res.user);
      return res.user;
    },
    [setUser]
  );

  const loginWithFirebaseOtp = useCallback(
    async (params: {
      phone: string;
      idToken: string;
      signup?: { name: string; email: string; address: string };
    }) => {
      const res = await AuthApi.loginWithFirebaseOtp(params);
      setUser(res.user);
      return res.user;
    },
    [setUser]
  );

  const register = useCallback(
    async (params: {
      name: string;
      email: string;
      password: string;
      phone: string;
      address?: string;
    }) => {
      const res = await AuthApi.register(params);
      setUser(res.user);
      return res.user;
    },
    [setUser]
  );

  const logout = useCallback(async () => {
    // Best-effort: unregister the push token server-side so this device stops getting
    // notifications targeted at the logged-out user. Do this *before* the auth call clears
    // the JWT, otherwise the DELETE request loses its Authorization header.
    await unregisterPushTokenForCurrentDevice().catch(() => undefined);
    await agoraVoiceService.cleanup().catch(() => undefined);
    nativeCallService.cleanupNativeCall();
    try {
      await AuthApi.logout();
    } finally {
      disconnectSocket();
      resetCall();
      useNotificationStore.getState().reset();
      resetAuth();
      qc.clear();
      setBadgeCount(0).catch(() => undefined);
    }
  }, [qc, resetAuth, resetCall]);

  return { login, loginWithFirebaseOtp, register, logout };
}
