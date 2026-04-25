import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "@/theme";
import { Text } from "./Text";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

type Props = {
  label: string;
  tone?: Tone;
};

const palette: Record<Tone, { bg: string; text: string }> = {
  neutral: { bg: colors.surfaceAlt, text: colors.textMuted },
  primary: { bg: colors.primarySoft, text: colors.primary },
  success: { bg: colors.successSoft, text: "#065F46" },
  warning: { bg: colors.warningSoft, text: "#92400E" },
  danger: { bg: colors.dangerSoft, text: "#991B1B" },
  info: { bg: colors.infoSoft, text: colors.primary }
};

export function Badge({ label, tone = "neutral" }: Props) {
  const p = palette[tone];
  return (
    <View style={[styles.base, { backgroundColor: p.bg }]}>
      <Text variant="caption" color={p.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill
  }
});
