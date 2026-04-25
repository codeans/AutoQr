import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

export function Loader({ label, inline = false }: { label?: string; inline?: boolean }) {
  return (
    <View style={[styles.base, inline ? styles.inline : styles.full]}>
      <ActivityIndicator color={colors.primary} size={inline ? "small" : "large"} />
      {label ? (
        <Text variant="small" muted style={{ marginTop: spacing.md }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", justifyContent: "center" },
  full: { flex: 1, padding: spacing.huge },
  inline: { paddingVertical: spacing.xl }
});
