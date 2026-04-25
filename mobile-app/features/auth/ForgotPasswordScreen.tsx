import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Header, Input, Screen, Text } from "@/components/ui";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/schemas/auth.schema";
import { AuthApi } from "@/services/api";
import { extractErrorMessage } from "@/utils/errors";
import { useAppStore } from "@/stores/app.store";
import { spacing } from "@/theme";

export function ForgotPasswordScreen() {
  const [submitting, setSubmitting] = useState(false);
  const pushToast = useAppStore((s) => s.pushToast);
  const { control, handleSubmit } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" }
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitting(true);
    try {
      await AuthApi.requestPasswordReset(values.email.trim());
      pushToast({
        title: "Check your email",
        message: "If an account exists, you'll receive a reset link.",
        tone: "success"
      });
      router.push({ pathname: "/(auth)/reset", params: { email: values.email.trim() } });
    } catch (err) {
      pushToast({
        title: "Request failed",
        message: extractErrorMessage(err),
        tone: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Reset password" />
      <View style={styles.header}>
        <Text variant="display">Forgot your password?</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Enter your email and we'll send you a code to reset it.
        </Text>
      </View>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button label="Send reset code" onPress={handleSubmit(onSubmit)} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xxxl }
});
