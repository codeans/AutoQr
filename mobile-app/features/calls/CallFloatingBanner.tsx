import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { useCallStore } from "@/stores/call.store";
import { colors, radius, shadows, spacing } from "@/theme";
import { formatDuration } from "@/utils/format";

export function CallFloatingBanner() {
  const status = useCallStore((s) => s.status);
  const startedAt = useCallStore((s) => s.startedAt);
  const activeCallId = useCallStore((s) => s.activeCallId);
  const incoming = useCallStore((s) => s.incoming);
  const pathname = usePathname();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt || status !== "active") {
      setElapsed(0);
      return;
    }

    setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startedAt, status]);

  const shouldShow =
    (status === "ringing" || status === "active" || status === "connecting") &&
    (activeCallId || incoming?.callId) &&
    !pathname?.startsWith("/call/");
  const showIncoming =
    status === "ringing" &&
    incoming?.callId &&
    !pathname?.startsWith("/call/") &&
    !pathname?.startsWith("/calls/incoming/");

  if (!shouldShow && !showIncoming) return null;

  const label =
    status === "ringing"
      ? "Incoming call"
      : status === "active"
        ? formatDuration(elapsed)
      : status === "connecting"
        ? "Connecting..."
        : "Incoming call";

  return (
    <Pressable
      onPress={() => {
        if (status === "ringing" && incoming?.callId) {
          router.push(`/calls/incoming/${incoming.callId}` as never);
        } else {
          router.push("/call/active");
        }
      }}
      style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.9 }]}
    >
      <View style={styles.banner}>
        <View style={styles.dot} />
        <View style={{ flex: 1 }}>
          <Text variant="smallMedium" style={{ color: colors.textInverse }}>
            {incoming?.carLabel ?? (status === "ringing" ? "Incoming call" : "Active call")}
          </Text>
          <Text variant="caption" style={{ color: colors.textInverse, opacity: 0.85 }}>
            {label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textInverse} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    top: spacing.huge,
    zIndex: 30
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.xl,
    ...shadows.md
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.textInverse
  }
});
