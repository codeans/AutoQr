import React, { useEffect } from "react";
import { Tabs, router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "@/theme";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permissionStore";
import { hasCriticalPermissions } from "@/services/permissions/permissionService";

export default function TabsLayout() {
  const { t } = useTranslation();
  const status = useAuthStore((s) => s.status);
  const hydrated = usePermissionStore((s) => s.hydrated);
  const statuses = usePermissionStore((s) => s.statuses);
  const lastCheckedAt = usePermissionStore((s) => s.lastCheckedAt);
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      if (!pathname.startsWith("/(auth)")) router.replace("/(auth)/login");
      return;
    }
    if (status === "authenticated" && hydrated) {
      if (!lastCheckedAt) return;
      const hasRequiredPermissions = hasCriticalPermissions(statuses);
      if (!hasRequiredPermissions) {
        if (pathname.startsWith("/permissions")) return;
        router.replace("/permissions" as never);
      }
    }
  }, [hydrated, lastCheckedAt, pathname, status, statuses]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSubtle,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          height: 64,
          paddingTop: 6,
          paddingBottom: 10
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 }
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("tabs.dashboard") as string,
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
        }}
      />
      <Tabs.Screen
        name="vehicles"
        options={{
          title: t("tabs.vehicles") as string,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="incidents"
        options={{
          title: t("tabs.incidents") as string,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="alert-circle-outline" size={size} color={color} />
          )
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t("tabs.settings") as string,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )
        }}
      />
    </Tabs>
  );
}
