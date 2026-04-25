import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  Easing,
  Linking,
  StyleSheet,
  View
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Screen, Text } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import {
  getAllPermissionStates,
  hasCriticalPermissions,
  isPermissionBlocked,
  PERMISSION_META,
  PERMISSION_REQUEST_ORDER,
  requestPermission
} from "@/services/permissions/permissionService";
import type { TrackedPermission } from "@/services/permissions/types";
import { usePermissionStore } from "@/stores/permissionStore";
import { registerPushToken } from "@/services/notifications/notifications";

type Stage = "welcome" | "intro" | "request" | "validation";

export function PermissionsOnboardingScreen() {
  const statuses = usePermissionStore((s) => s.statuses);
  const setStatus = usePermissionStore((s) => s.setStatus);
  const setStatuses = usePermissionStore((s) => s.setStatuses);
  const setOnboardingSeen = usePermissionStore((s) => s.setOnboardingSeen);
  const setOnboardingCompleted = usePermissionStore((s) => s.setOnboardingCompleted);

  const [stage, setStage] = useState<Stage>("welcome");
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [blockedPermission, setBlockedPermission] = useState<TrackedPermission | null>(null);
  const [loading, setLoading] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(14)).current;

  const currentPermission = PERMISSION_REQUEST_ORDER[currentRequestIndex] ?? null;
  const currentMeta = useMemo(
    () => PERMISSION_META.find((item) => item.key === currentPermission),
    [currentPermission]
  );
  const blockedMeta = useMemo(
    () => PERMISSION_META.find((item) => item.key === blockedPermission),
    [blockedPermission]
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start();
  }, [fade, slide, stage, currentRequestIndex, blockedPermission]);

  useEffect(() => {
    void refreshPermissionStatuses();

    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") return;
      void refreshPermissionStatuses();
    });
    return () => sub.remove();
  }, []);

  async function refreshPermissionStatuses() {
    const fresh = await getAllPermissionStates();
    setStatuses(fresh);
    if (blockedPermission && fresh[blockedPermission] === "granted") {
      setBlockedPermission(null);
    }
  }

  async function handleRequestCurrentPermission() {
    if (!currentPermission || !currentMeta) return;
    setLoading(true);
    setStatus(currentPermission, "pending");

    const next = await requestPermission(currentPermission);
    setStatus(currentPermission, next);
    if (currentPermission === "notifications" && next === "granted") {
      registerPushToken().catch(() => undefined);
    }

    setLoading(false);
    if (next === "granted") {
      if (currentRequestIndex < PERMISSION_REQUEST_ORDER.length - 1) {
        setCurrentRequestIndex((index) => index + 1);
      } else {
        setStage("validation");
      }
      return;
    }
    if (isPermissionBlocked(next)) {
      setBlockedPermission(currentPermission);
    }
  }

  function onStartFlow() {
    setOnboardingSeen(true);
    setStage("intro");
  }

  function onStartRequests() {
    setStage("request");
    setCurrentRequestIndex(0);
  }

  function finishIfValid() {
    const hasRequired = hasCriticalPermissions(statuses);
    if (!hasRequired) {
      const requiredMissing = PERMISSION_META.find(
        (item) => item.requiredForAppAccess && statuses[item.key] !== "granted"
      );
      if (requiredMissing) setBlockedPermission(requiredMissing.key);
      return;
    }

    setOnboardingCompleted(true);
    router.replace("/(tabs)/dashboard");
  }

  async function onRetryBlockedPermission() {
    if (!blockedPermission) return;
    setLoading(true);
    setStatus(blockedPermission, "pending");
    const next = await requestPermission(blockedPermission);
    setStatus(blockedPermission, next);
    if (blockedPermission === "notifications" && next === "granted") {
      registerPushToken().catch(() => undefined);
    }
    setLoading(false);

    if (next === "granted") {
      setBlockedPermission(null);
      const index = PERMISSION_REQUEST_ORDER.findIndex((item) => item === blockedPermission);
      if (index >= 0 && index < PERMISSION_REQUEST_ORDER.length - 1) {
        setCurrentRequestIndex(index + 1);
        setStage("request");
      } else {
        setStage("validation");
      }
    }
  }

  function renderProgress(activeIndex: number) {
    return (
      <View style={styles.progressRow}>
        {PERMISSION_REQUEST_ORDER.map((item, idx) => {
          const granted = statuses[item] === "granted";
          const active = idx === activeIndex;
          return (
            <View
              key={item}
              style={[
                styles.progressDot,
                granted && styles.progressGranted,
                active && styles.progressActive
              ]}
            />
          );
        })}
      </View>
    );
  }

  if (blockedPermission && blockedMeta) {
    const isRequired = blockedMeta.requiredForAppAccess;
    return (
      <Screen scroll={false} padded edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.flexTop}>
            <View style={styles.heroIcon}>
              <Ionicons name={blockedMeta.icon as keyof typeof Ionicons.glyphMap} size={30} color={colors.primary} />
            </View>
            <Text variant="h2" align="center">
              {blockedMeta.title} required
            </Text>
            <Text variant="body" muted align="center" style={styles.bodyText}>
              This permission is required for AutoQr to function properly.
            </Text>
            <Card tone="soft" style={styles.reasonCard}>
              <Text variant="bodyMedium">{blockedMeta.whyAutoQrNeedsIt}</Text>
            </Card>
          </View>

          <View style={styles.actionBlock}>
            <Button
              label={loading ? "Retrying..." : "Retry Permission"}
              onPress={onRetryBlockedPermission}
              disabled={loading}
            />
            <Button
              label="Open Settings"
              variant="ghost"
              onPress={() => Linking.openSettings().catch(() => undefined)}
              disabled={loading}
            />
            {!isRequired ? (
              <Button
                label="Continue for now"
                variant="secondary"
                onPress={() => {
                  setBlockedPermission(null);
                  if (currentRequestIndex < PERMISSION_REQUEST_ORDER.length - 1) {
                    setCurrentRequestIndex((index) => index + 1);
                    setStage("request");
                  } else {
                    setStage("validation");
                  }
                }}
              />
            ) : null}
          </View>
        </Animated.View>
      </Screen>
    );
  }

  if (stage === "welcome") {
    return (
      <Screen scroll={false} padded edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.flexTop}>
            <Text variant="h1" align="center">
              Welcome to AutoQr
            </Text>
            <Text variant="body" muted align="center" style={styles.bodyText}>
              Before you start, we will quickly set up permissions for realtime calls, notifications,
              uploads, and secure communication.
            </Text>
          </View>
          <View style={styles.actionBlock}>
            <Button label="Continue" onPress={onStartFlow} />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  if (stage === "intro") {
    return (
      <Screen scroll={false} padded edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.flexTop}>
            <Text variant="h2" align="center">
              Permission setup
            </Text>
            <Text variant="body" muted align="center" style={styles.bodyText}>
              We only ask for permissions that directly improve incident response and owner contact.
            </Text>
            <Card tone="soft" style={styles.listCard}>
              {PERMISSION_REQUEST_ORDER.map((key) => {
                const meta = PERMISSION_META.find((item) => item.key === key);
                if (!meta) return null;
                return (
                  <View key={meta.key} style={styles.listRow}>
                    <Ionicons
                      name={meta.icon as keyof typeof Ionicons.glyphMap}
                      size={18}
                      color={colors.primary}
                    />
                    <Text variant="bodyMedium" style={{ flex: 1 }}>
                      {meta.title}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </View>
          <View style={styles.actionBlock}>
            <Button label="Start setup" onPress={onStartRequests} />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  if (stage === "request" && currentMeta) {
    return (
      <Screen scroll={false} padded edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
          <View style={styles.flexTop}>
            {renderProgress(currentRequestIndex)}
            <View style={styles.heroIcon}>
              <Ionicons
                name={currentMeta.icon as keyof typeof Ionicons.glyphMap}
                size={30}
                color={colors.primary}
              />
            </View>
            <Text variant="h2" align="center">
              {currentMeta.title}
            </Text>
            <Text variant="body" muted align="center" style={styles.bodyText}>
              {currentMeta.shortExplanation}
            </Text>
            <Card tone="soft" style={styles.reasonCard}>
              <Text variant="bodyMedium">{currentMeta.whyAutoQrNeedsIt}</Text>
            </Card>
          </View>

          <View style={styles.actionBlock}>
            <Button
              label={loading ? "Requesting..." : "Continue"}
              onPress={handleRequestCurrentPermission}
              disabled={loading}
            />
          </View>
        </Animated.View>
      </Screen>
    );
  }

  const hasRequired = hasCriticalPermissions(statuses);
  return (
    <Screen scroll={false} padded edges={["top", "left", "right", "bottom"]}>
      <Animated.View style={[styles.flex, { opacity: fade, transform: [{ translateY: slide }] }]}>
        <View style={styles.flexTop}>
          <Text variant="h2" align="center">
            Permission check complete
          </Text>
          <Text variant="body" muted align="center" style={styles.bodyText}>
            Review permission status before entering AutoQr.
          </Text>
          <Card tone="soft" style={styles.listCard}>
            {PERMISSION_REQUEST_ORDER.map((key) => {
              const meta = PERMISSION_META.find((item) => item.key === key);
              if (!meta) return null;
              const granted = statuses[key] === "granted";
              return (
                <View key={key} style={styles.listRow}>
                  <Ionicons
                    name={granted ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={granted ? colors.success : colors.danger}
                  />
                  <Text variant="bodyMedium" style={{ flex: 1 }}>
                    {meta.title}
                  </Text>
                </View>
              );
            })}
          </Card>
        </View>
        <View style={styles.actionBlock}>
          <Button label={hasRequired ? "Go to dashboard" : "Fix required permissions"} onPress={finishIfValid} />
          {!hasRequired ? (
            <Text variant="small" muted align="center">
              Notifications and microphone are required before app access.
            </Text>
          ) : null}
        </View>
      </Animated.View>
      {loading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, justifyContent: "space-between" },
  flexTop: { paddingTop: spacing.xl, gap: spacing.lg },
  bodyText: { lineHeight: 24 },
  heroIcon: {
    width: 76,
    height: 76,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  actionBlock: { gap: spacing.sm, paddingBottom: spacing.md },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8
  },
  progressDot: {
    width: 26,
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.border
  },
  progressActive: { backgroundColor: colors.primarySoft, width: 32 },
  progressGranted: { backgroundColor: colors.primary },
  reasonCard: { padding: spacing.lg },
  listCard: { padding: spacing.lg, gap: spacing.md },
  listRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  loader: { marginBottom: spacing.md }
});
