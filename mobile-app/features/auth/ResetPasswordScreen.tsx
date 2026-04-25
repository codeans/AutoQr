import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Header, Input, Screen, Text } from "@/components/ui";
import { resetPasswordSchema, type ResetPasswordValues } from "@/schemas/auth.schema";
import { AuthApi } from "@/services/api";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import { spacing } from "@/theme";

export function ResetPasswordScreen() {
  const [submitting, setSubmitting] = useState(false);
  const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
  const pushToast = useAppStore((s) => s.pushToast);
  const { control, handleSubmit } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { code: "", password: "", confirmPassword: "" }
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!emailParam) {
      pushToast({ title: "Missing email", message: "Start the flow again.", tone: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      await AuthApi.resetPassword({
        email: emailParam,
        code: values.code.trim(),
        password: values.password
      });
      pushToast({ title: "Password updated", message: "Sign in with your new password.", tone: "success" });
      router.replace("/(auth)/login");
    } catch (err) {
      pushToast({ title: "Reset failed", message: extractErrorMessage(err), tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Set new password" />
      <View style={styles.header}>
        <Text variant="display">Create a new password</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Enter the 6-digit code we emailed you, then choose a new password.
        </Text>
      </View>
      <Controller
        control={control}
        name="code"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Code"
            keyboardType="number-pad"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="New password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Confirm password"
            secureTextEntry
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button label="Update password" onPress={handleSubmit(onSubmit)} loading={submitting} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xxxl }
});
