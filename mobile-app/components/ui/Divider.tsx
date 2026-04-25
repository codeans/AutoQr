import React from "react";
import { View } from "react-native";
import { colors, spacing } from "@/theme";

export function Divider({ inset = 0, vertical = false }: { inset?: number; vertical?: boolean }) {
  if (vertical) {
    return <View style={{ width: 1, backgroundColor: colors.border, marginHorizontal: inset }} />;
  }
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
        marginLeft: inset
      }}
    />
  );
}
