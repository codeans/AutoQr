import React from "react";
import { StyleSheet, Text as RNText, TextProps as RNTextProps } from "react-native";
import { colors, typography, type TypographyToken } from "@/theme";

type TextVariant = TypographyToken;

type Props = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  align?: "left" | "center" | "right";
  muted?: boolean;
};

export function Text({ variant = "body", color, align, muted, style, children, ...rest }: Props) {
  const base = typography[variant];
  return (
    <RNText
      allowFontScaling
      {...rest}
      style={[
        base,
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        align ? { textAlign: align } : null,
        style
      ]}
    >
      {children}
    </RNText>
  );
}

export const textStyles = StyleSheet.create({
  link: { color: colors.primary, fontWeight: "600" }
});
