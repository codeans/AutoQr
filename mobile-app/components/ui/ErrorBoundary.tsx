import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "@/theme";
import { Text } from "./Text";
import { Button } from "./Button";

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Unexpected error"
    };
  }

  componentDidCatch(error: unknown): void {
    if (__DEV__) console.error("ErrorBoundary", error);
  }

  reset = () => this.setState({ hasError: false, message: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrap}>
        <Text variant="h1" align="center">
          Something broke
        </Text>
        <Text variant="body" muted align="center" style={styles.msg}>
          {this.state.message ?? "An unexpected error occurred."}
        </Text>
        <Button label="Reload" onPress={this.reset} fullWidth={false} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl
  },
  msg: { marginVertical: spacing.lg, maxWidth: 320 }
});
