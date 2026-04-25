import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/theme";
import { Text } from "./Text";
import { initialsOf } from "@/utils/format";

type Props = { name?: string | null; size?: number };

export function Avatar({ name, size = 44 }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text variant="bodyMedium" color={colors.primary}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  }
});
