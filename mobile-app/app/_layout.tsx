import React, { useEffect, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { initI18n } from "@/i18n";
import { ErrorBoundary, ToastStack } from "@/components/ui";
import { SplashLoader } from "@/components/common/SplashLoader";
import { useBootstrap } from "@/hooks/useBootstrap";
import { useSocket } from "@/hooks/useSocket";
import { useCallSocketHandlers } from "@/features/calls/callSocketHandlers";
import { useNativeCallHandlers } from "@/features/calls/useNativeCallHandlers";
import { useNotificationSocketHandlers } from "@/features/notifications/notificationSocketHandlers";
import { useNotificationHandlers } from "@/features/notifications/notificationHandlers";
import { CallFloatingBanner } from "@/features/calls/CallFloatingBanner";
import { useAuthStore } from "@/stores/auth.store";
import { registerExpoPushToken, setBadgeCount } from "@/services/notifications/notificationService";
import { useNotificationStore } from "@/stores/notification.store";
import { notificationsService } from "@/services/api/notifications.service";
import { getAllPermissionStates, hasCriticalPermissions } from "@/services/permissions/permissionService";
import { usePermissionStore } from "@/stores/permissionStore";
import {
  handleForegroundMessage,
  registerFCMToken
} from "@/services/notifications/fcmService";
import { handleKilledAppIncomingCall, registerDeviceForCalls } from "@/features/calls/backgroundCallHandler";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000
    }
  }
});

function AppGate() {
  useBootstrap();
  useSocket();
  useCallSocketHandlers();
  useNativeCallHandlers();
  useNotificationSocketHandlers();
  useNotificationHandlers();

  const status = useAuthStore((s) => s.status);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
  const hydratedPermissions = usePermissionStore((s) => s.hydrated);
  const setPermissionStatuses = usePermissionStore((s) => s.setStatuses);
  const setOnboardingCompleted = usePermissionStore((s) => s.setOnboardingCompleted);
  const [splashDone, setSplashDone] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);

  useEffect(() => {
    initI18n()
      .catch(() => undefined)
      .finally(() => setI18nReady(true));
  }, []);

  useEffect(() => {
    if (status !== "booting") {
      SplashScreen.hideAsync().catch(() => undefined);
    }
    if (status === "authenticated") {
      registerExpoPushToken().catch(() => undefined);
      registerFCMToken().catch(() => undefined);
      registerDeviceForCalls().catch(() => undefined);
      notificationsService
        .unreadCount()
        .then(({ count }) => {
          setUnreadCount(count);
          setBadgeCount(count).catch(() => undefined);
        })
        .catch(() => undefined);
    }
    if (status === "unauthenticated") {
      useNotificationStore.getState().reset();
      setBadgeCount(0).catch(() => undefined);
    }
  }, [status, setUnreadCount]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const unsubscribe = handleForegroundMessage();
    handleKilledAppIncomingCall().catch(() => undefined);
    return () => {
      unsubscribe?.();
    };
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !hydratedPermissions) return;
    getAllPermissionStates()
      .then((fresh) => {
        setPermissionStatuses(fresh);
        if (hasCriticalPermissions(fresh)) {
          setOnboardingCompleted(true);
        }
      })
      .catch(() => undefined);
  }, [hydratedPermissions, setOnboardingCompleted, setPermissionStatuses, status]);

  // Refresh unread count + push token on foreground
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      if (next !== "active") return;
      if (useAuthStore.getState().status !== "authenticated") return;
      registerExpoPushToken().catch(() => undefined);
      registerFCMToken().catch(() => undefined);
      handleKilledAppIncomingCall().catch(() => undefined);
      getAllPermissionStates()
        .then((fresh) => {
          usePermissionStore.getState().setStatuses(fresh);
          if (hasCriticalPermissions(fresh)) {
            usePermissionStore.getState().setOnboardingCompleted(true);
          }
        })
        .catch(() => undefined);
      notificationsService
        .unreadCount()
        .then(({ count }) => {
          setUnreadCount(count);
          setBadgeCount(count).catch(() => undefined);
        })
        .catch(() => undefined);
    });
    return () => sub.remove();
  }, [setUnreadCount]);

  const showSplash = !splashDone || status === "booting" || !i18nReady;

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#FFFFFF" },
          animation: "slide_from_right"
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="activate" />
        <Stack.Screen name="vehicles/new" />
        <Stack.Screen name="vehicles/[id]" />
        <Stack.Screen name="incidents/[id]" />
        <Stack.Screen name="notifications" options={{ title: "Notifications" }} />
        <Stack.Screen name="call/incoming" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="calls/incoming/[callId]" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="call/active" options={{ animation: "fade", gestureEnabled: false }} />
        <Stack.Screen name="call/history" />
        <Stack.Screen name="call/missed" />
        <Stack.Screen name="permissions/index" options={{ animation: "slide_from_right", gestureEnabled: false }} />
        <Stack.Screen name="permissions/notifications" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="permissions/microphone" options={{ animation: "slide_from_bottom" }} />
        <Stack.Screen name="settings/profile" />
        <Stack.Screen name="settings/password" />
        <Stack.Screen name="settings/support" />
        <Stack.Screen name="settings/calls" />
        <Stack.Screen name="settings/permissions" />
        <Stack.Screen name="settings/language" />
        <Stack.Screen name="settings/legal/[slug]" />
      </Stack>
      <CallFloatingBanner />
      {showSplash ? <SplashLoader onFinish={() => setSplashDone(true)} /> : null}
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <StatusBar style="dark" />
            <AppGate />
            <ToastStack />
          </ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
