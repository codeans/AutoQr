import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import { router, usePathname } from "expo-router";
import { Loader } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { usePermissionStore } from "@/stores/permissionStore";
import { colors } from "@/theme";
import { hasCriticalPermissions } from "@/services/permissions/permissionService";

export default function IndexGate() {
  const status = useAuthStore((s) => s.status);
  const hydrated = usePermissionStore((s) => s.hydrated);
  const statuses = usePermissionStore((s) => s.statuses);
  const lastCheckedAt = usePermissionStore((s) => s.lastCheckedAt);
  const pathname = usePathname();
  const lastRedirectRef = useRef<string | null>(null);

  useEffect(() => {
    const safeReplace = (target: string) => {
      if (pathname === target || pathname.startsWith(`${target}/`)) return;
      if (lastRedirectRef.current === target) return;
      lastRedirectRef.current = target;
      router.replace(target as never);
    };

    if (status === "authenticated" && hydrated) {
      if (!lastCheckedAt) return;
      const hasRequiredPermissions = hasCriticalPermissions(statuses);
      if (!hasRequiredPermissions) {
        safeReplace("/permissions");
        return;
      }
      safeReplace("/(tabs)/dashboard");
      return;
    }
    if (status === "unauthenticated") {
      safeReplace("/(auth)/login");
      return;
    }
    lastRedirectRef.current = null;
  }, [hydrated, lastCheckedAt, pathname, status, statuses]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Loader />
    </View>
  );
}
