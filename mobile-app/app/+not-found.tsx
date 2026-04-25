import React from "react";
import { router } from "expo-router";
import { Button, Screen, Text } from "@/components/ui";
import { spacing } from "@/theme";

export default function NotFound() {
  return (
    <Screen>
      <Text variant="display" align="center" style={{ marginTop: spacing.huge }}>
        Page not found
      </Text>
      <Text variant="body" muted align="center" style={{ marginTop: spacing.md }}>
        The screen you tried to open doesn't exist.
      </Text>
      <Button
        label="Go home"
        onPress={() => router.replace("/")}
        style={{ marginTop: spacing.xl }}
      />
    </Screen>
  );
}
