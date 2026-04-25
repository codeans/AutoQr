import React from "react";
import { StyleSheet, View } from "react-native";
import { spacing } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";

type Props = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorView({
  title = "Something went wrong",
  message = "Please check your connection and try again.",
  onRetry
}: Props) {
  return (
    <View style={styles.container}>
      <Text variant="h2" align="center">
        {title}
      </Text>
      <Text variant="body" muted align="center" style={styles.message}>
        {message}
      </Text>
      {onRetry ? (
        <Button label="Try again" onPress={onRetry} fullWidth={false} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.huge, alignItems: "center" },
  message: { marginTop: spacing.sm, maxWidth: 320 },
  button: { marginTop: spacing.xl }
});
