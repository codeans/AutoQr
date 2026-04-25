import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, shadows, spacing } from "@/theme";
import { Text } from "./Text";
import { useAppStore } from "@/stores/app.store";

const toneColors: Record<string, { bg: string; text: string }> = {
  info: { bg: colors.primary, text: colors.textInverse },
  success: { bg: colors.success, text: colors.textInverse },
  warning: { bg: colors.warning, text: "#7C2D12" },
  danger: { bg: colors.danger, text: colors.textInverse }
};

export function ToastStack() {
  const toasts = useAppStore((s) => s.toasts);
  if (toasts.length === 0) return null;

  return (
    <SafeAreaView pointerEvents="box-none" style={styles.container} edges={["top"]}>
      {toasts.map((t) => {
        const palette = toneColors[t.tone ?? "info"];
        return (
          <View
            key={t.id}
            style={[styles.toast, { backgroundColor: palette.bg }]}
          >
            <Text variant="bodyMedium" color={palette.text}>
              {t.title}
            </Text>
            {t.message ? (
              <Text
                variant="small"
                color={palette.text}
                style={{ marginTop: 2, opacity: 0.9 }}
              >
                {t.message}
              </Text>
            ) : null}
          </View>
        );
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    paddingHorizontal: spacing.xl,
    alignItems: "center"
  },
  toast: {
    marginTop: spacing.sm,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minWidth: 260,
    maxWidth: 420,
    ...shadows.md
  }
});
