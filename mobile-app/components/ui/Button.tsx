import React from "react";
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle
} from "react-native";
import { colors, radius, spacing } from "@/theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

type Props = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

const palette: Record<Variant, { bg: string; text: string; border?: string; pressed: string }> = {
  primary: { bg: colors.primary, text: colors.textInverse, pressed: colors.primaryDark },
  secondary: {
    bg: colors.primarySoft,
    text: colors.primary,
    pressed: "#CFDDFB"
  },
  ghost: {
    bg: "transparent",
    text: colors.primary,
    border: colors.border,
    pressed: colors.surfaceAlt
  },
  danger: { bg: colors.danger, text: colors.textInverse, pressed: "#DC2626" }
};

export function Button({
  label,
  variant = "primary",
  size = "lg",
  loading,
  disabled,
  icon,
  fullWidth = true,
  style,
  ...rest
}: Props) {
  const tone = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        size === "md" && styles.md,
        size === "lg" && styles.lg,
        fullWidth && styles.full,
        { backgroundColor: pressed && !isDisabled ? tone.pressed : tone.bg },
        tone.border ? { borderWidth: 1, borderColor: tone.border } : null,
        isDisabled && styles.disabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tone.text} />
      ) : (
        <View style={styles.row}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text variant="bodyMedium" color={tone.text}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center"
  },
  md: { minHeight: 44 },
  lg: { minHeight: 52 },
  full: { alignSelf: "stretch" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  icon: { marginRight: spacing.sm },
  disabled: { opacity: 0.55 }
});
