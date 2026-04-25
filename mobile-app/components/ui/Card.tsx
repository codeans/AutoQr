import React from "react";
import { Pressable, StyleSheet, View, ViewProps, ViewStyle } from "react-native";
import { colors, radius, shadows, spacing } from "@/theme";

type Props = ViewProps & {
  onPress?: () => void;
  padding?: keyof typeof spacing;
  tone?: "default" | "soft";
  style?: ViewStyle;
};

export function Card({
  children,
  onPress,
  padding = "xxl",
  tone = "default",
  style,
  ...rest
}: Props) {
  const content = (
    <View
      style={[
        styles.card,
        { padding: spacing[padding] },
        tone === "soft" && styles.soft,
        style
      ]}
      {...rest}
    >
      {children}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm
  },
  soft: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.border,
    shadowOpacity: 0,
    elevation: 0
  },
  pressed: { opacity: 0.92 }
});
