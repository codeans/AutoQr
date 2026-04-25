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
  const onboardingCompleted = usePermissionStore((s) => s.onboardingCompleted);
  const statuses = usePermissionStore((s) => s.statuses);

  useEffect(() => {
    if (status === "authenticated" && hydrated) {
      if (!onboardingCompleted || !hasCriticalPermissions(statuses)) {
        router.replace("/permissions" as never);
        return;
      }
      router.replace("/(tabs)/dashboard");
    }
    else if (status === "unauthenticated") router.replace("/(auth)/login");
  }, [hydrated, onboardingCompleted, status, statuses]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Loader />
    </View>
  );
}
