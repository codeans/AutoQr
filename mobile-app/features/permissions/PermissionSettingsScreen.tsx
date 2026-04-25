import React, { useCallback, useEffect, useState } from "react";
import { AppState, Linking, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge, Button, Card, Header, Screen, Text } from "@/components/ui";
import { colors, spacing } from "@/theme";
import {
  getAllPermissionStates,
  PERMISSION_META,
  requestMicrophonePermission,
  requestPermission
} from "@/services/permissions/permissionService";
import type { PermissionState, TrackedPermission } from "@/services/permissions/types";
import { usePermissionStore } from "@/stores/permissionStore";

function statusLabel(state: PermissionState): { label: string; tone: "success" | "warning" | "danger" | "neutral" } {
  if (state === "granted") return { label: "Granted", tone: "success" };
  if (state === "pending") return { label: "Pending", tone: "warning" };
  if (state === "blocked") return { label: "Blocked", tone: "danger" };
  if (state === "denied") return { label: "Denied", tone: "danger" };
  return { label: "Unknown", tone: "neutral" };
}

export function PermissionSettingsScreen() {
  const statuses = usePermissionStore((s) => s.statuses);
  const setStatuses = usePermissionStore((s) => s.setStatuses);
  const [busyPermission, setBusyPermission] = useState<TrackedPermission | null>(null);

  const refreshStatuses = useCallback(() => {
    getAllPermissionStates().then(setStatuses).catch(() => undefined);
  }, [setStatuses]);

  useEffect(() => {
    refreshStatuses();
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "active") refreshStatuses();
    });
    return () => sub.remove();
  }, [refreshStatuses]);

  const handleRetryPermission = useCallback(async (permission: TrackedPermission) => {
    setBusyPermission(permission);
    try {
      if (permission === "microphone") {
        await requestMicrophonePermission();
      } else {
        await requestPermission(permission);
      }
    } finally {
      setBusyPermission(null);
    }
    refreshStatuses();
  }, [refreshStatuses]);

  return (
    <Screen>
      <Header title="App Permissions" />
      <Text variant="body" muted style={{ marginBottom: spacing.md }}>
        Control AutoQr permission access for calling, notifications, uploads, and realtime safety features.
      </Text>

      <Card padding="lg">
        <View style={styles.stack}>
          {PERMISSION_META.map((item) => {
            const status = statusLabel(statuses[item.key]);
            const showRetry = statuses[item.key] === "denied" || statuses[item.key] === "unknown";
            const showOpenSettings = statuses[item.key] === "blocked";
            const isBusy = busyPermission === item.key;
            return (
              <View key={item.key} style={styles.row}>
                <View style={styles.left}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{item.title}</Text>
                    <Text variant="caption" muted>
                      {item.shortExplanation}
                    </Text>
                  </View>
                </View>
                <View style={styles.right}>
                  <Badge label={status.label} tone={status.tone} />
                  {showRetry ? (
                    <Button
                      label={isBusy ? "Requesting..." : "Retry"}
                      size="md"
                      variant="ghost"
                      fullWidth={false}
                      onPress={() => void handleRetryPermission(item.key)}
                      disabled={isBusy}
                    />
                  ) : null}
                  {showOpenSettings ? (
                    <Button
                      label="Open Settings"
                      size="md"
                      variant="ghost"
                      fullWidth={false}
                      onPress={() => Linking.openSettings().catch(() => undefined)}
                    />
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <View style={{ marginTop: spacing.lg }}>
        <Button
          label="Open Settings"
          variant="ghost"
          onPress={() => Linking.openSettings().catch(() => undefined)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: spacing.sm },
  right: { alignItems: "flex-end", gap: 4 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
