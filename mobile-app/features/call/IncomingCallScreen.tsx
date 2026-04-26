import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useCallStore } from "@/stores/call.store";
import { useCallActions } from "@/hooks/useCallActions";
import { colors, radius, spacing } from "@/theme";
import { Text } from "@/components/ui";
import { Avatar } from "@/components/ui/Avatar";
import { maskPhone } from "@/utils/format";
import { callsService } from "@/services/api/calls.service";

export function IncomingCallScreen() {
  const incoming = useCallStore((s) => s.incoming);
  const status = useCallStore((s) => s.status);
  const setIncoming = useCallStore((s) => s.setIncoming);
  const { accept, reject } = useCallActions();
  const params = useLocalSearchParams<{ callId?: string; action?: string }>();

  useEffect(() => {
    const callId = typeof params.callId === "string" ? params.callId : "";
    if (!callId) return;
    if (incoming?.callId === callId) return;
    callsService
      .get(callId)
      .then(({ call }) => {
        if (!call?.callId) return;
        if (call.status && call.status !== "ringing" && call.status !== "accepted" && call.status !== "connected") {
          useCallStore.getState().setStatus(call.status === "missed" ? "missed" : "ended");
          return;
        }
        setIncoming(call);
      })
      .catch(() => undefined);
  }, [incoming?.callId, params.callId, setIncoming]);

  useEffect(() => {
    const action = typeof params.action === "string" ? params.action.toLowerCase() : "";
    if (!incoming?.callId || !action) return;
    if (action === "accept") {
      accept();
      return;
    }
    if (action === "decline" || action === "reject") {
      reject("owner_rejected");
    }
  }, [accept, incoming?.callId, params.action, reject]);

  useEffect(() => {
    if (status === "connecting" || status === "active") {
      router.replace("/call/active");
    }
    if (status === "idle" || status === "missed" || status === "declined" || status === "ended") {
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/dashboard");
    }
  }, [status]);

  if (!incoming) return null;

  return (
    <View style={styles.root}>
      <View style={[StyleSheet.absoluteFill, styles.backdrop]} />
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <StatusBar style="dark" />

        <View style={styles.top}>
          <Text variant="overline" style={{ color: colors.primary }}>
            INCOMING CALL · AUTOQR
          </Text>
          <Text variant="display" align="center" style={{ marginTop: spacing.sm }}>
            {maskPhone(incoming.reporterPhone)}
          </Text>
          {incoming.carLabel ? (
            <View style={styles.carBadge}>
              <Ionicons name="car-sport" size={14} color={colors.primary} />
              <Text variant="smallMedium" style={{ color: colors.primary }}>
                {incoming.carLabel}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.center}>
          <View style={[styles.pulse, styles.pulseOuter]} />
          <View style={[styles.pulse, styles.pulseInner]} />
          <View style={styles.avatarWrap}>
            <Avatar name={incoming.reporterName ?? undefined} size={120} />
          </View>
        </View>

        {incoming.message ? (
          <View style={styles.messageBox}>
            <Ionicons name="chatbubble-ellipses" size={16} color={colors.primary} />
            <Text variant="body" align="center" style={{ flex: 1 }}>
              "{incoming.message}"
            </Text>
          </View>
        ) : null}

        {incoming.imageCount && incoming.imageCount > 0 ? (
          <View style={styles.evidenceRow}>
            <Ionicons name="image" size={14} color={colors.textMuted} />
            <Text variant="caption" muted>
              {incoming.imageCount} photo{incoming.imageCount === 1 ? "" : "s"} attached · open after the call to review
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <CallActionButton
            color={colors.danger}
            icon="call"
            label="Decline"
            onPress={() => reject()}
            rotate
          />
          <CallActionButton
            color={colors.success}
            icon="call"
            label="Accept"
            onPress={accept}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function CallActionButton({
  color,
  icon,
  label,
  onPress,
  rotate
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  rotate?: boolean;
}) {
  return (
    <Pressable style={styles.actionBtn} onPress={onPress} hitSlop={12}>
      <View style={[styles.actionCircle, { backgroundColor: color }]}>
        <Ionicons
          name={icon}
          size={30}
          color={colors.textInverse}
          style={rotate ? { transform: [{ rotate: "135deg" }] } : undefined}
        />
      </View>
      <Text variant="smallMedium" style={{ marginTop: spacing.sm }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  backdrop: { backgroundColor: colors.primaryTint, opacity: 0.6 },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl
  },
  top: { alignItems: "center", paddingTop: spacing.huge, gap: spacing.xs },
  carBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    marginTop: spacing.sm
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  pulse: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.primarySoft
  },
  pulseInner: { width: 180, height: 180, opacity: 0.55 },
  pulseOuter: { width: 260, height: 260, opacity: 0.3 },
  avatarWrap: { borderRadius: 120, overflow: "hidden" },
  messageBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.xl,
    marginBottom: spacing.sm
  },
  evidenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginBottom: spacing.xl
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingBottom: spacing.xl
  },
  actionBtn: { alignItems: "center" },
  actionCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center"
  }
});
