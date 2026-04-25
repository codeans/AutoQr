import React from "react";
import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import type { CallStatus } from "@/services/api/calls.service";

type Props = { status: CallStatus };

const STYLE_BY_STATUS: Record<CallStatus, { label: string; bg: string; tint: string; icon: keyof typeof Ionicons.glyphMap }> = {
  ringing: { label: "Ringing", bg: colors.warningSoft, tint: colors.warning, icon: "call-outline" },
  accepted: { label: "Accepted", bg: colors.successSoft, tint: colors.success, icon: "call" },
  connected: { label: "Connected", bg: colors.successSoft, tint: colors.success, icon: "call" },
  ended: { label: "Ended", bg: colors.surfaceAlt, tint: colors.textSubtle, icon: "call-outline" },
  missed: { label: "Missed", bg: colors.dangerSoft, tint: colors.danger, icon: "call-outline" },
  declined: { label: "Declined", bg: colors.dangerSoft, tint: colors.danger, icon: "close-circle" },
  rejected: { label: "Declined", bg: colors.dangerSoft, tint: colors.danger, icon: "close-circle" },
  failed: { label: "Failed", bg: colors.dangerSoft, tint: colors.danger, icon: "warning" },
  cancelled: { label: "Cancelled", bg: colors.surfaceAlt, tint: colors.textSubtle, icon: "close-circle" }
};

export function CallStatusBadge({ status }: Props) {
  const style = STYLE_BY_STATUS[status] ?? STYLE_BY_STATUS.ended;
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Ionicons name={style.icon} size={12} color={style.tint} />
      <Text variant="caption" style={[styles.label, { color: style.tint }]}>
        {style.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill
  },
  label: { letterSpacing: 0.3 }
});
