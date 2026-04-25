import React, { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";
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

  useEffect(() => {
    if (status === "authenticated" && hydrated) {
      if (!lastCheckedAt) return;
      const hasRequiredPermissions = hasCriticalPermissions(statuses);
      if (!hasRequiredPermissions) {
        router.replace("/permissions" as never);
        return;
      }
      router.replace("/(tabs)/dashboard");
    }
    else if (status === "unauthenticated") router.replace("/(auth)/login");
  }, [hydrated, lastCheckedAt, status, statuses]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Loader />
    </View>
  );
}
