import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
};

export function Header({ title, subtitle, showBack = true, right, onBack }: Props) {
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) router.back();
  };

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable onPress={handleBack} hitSlop={12} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.back} />
      )}
      <View style={styles.center}>
        {title ? (
          <Text variant="h3" align="center" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="small" muted align="center" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    marginBottom: spacing.lg
  },
  back: { width: 40, alignItems: "flex-start" },
  right: { width: 40, alignItems: "flex-end" },
  center: { flex: 1, alignItems: "center" }
});
