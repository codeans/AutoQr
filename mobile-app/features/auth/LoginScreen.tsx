import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Screen, Text, textStyles } from "@/components/ui";
import { loginSchema, type LoginValues } from "@/schemas/auth.schema";
import { useAuthActions } from "@/hooks/useAuthActions";
import { extractErrorMessage } from "@/utils/errors";
import { colors, spacing } from "@/theme";
import { useAppStore } from "@/stores/app.store";

export function LoginScreen() {
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuthActions();
  const pushToast = useAppStore((s) => s.pushToast);
  const { control, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" }
  });

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true);
    try {
      await login(values.email.trim(), values.password);
      router.replace("/");
    } catch (err) {
      pushToast({
        title: "Sign in failed",
        message: extractErrorMessage(err),
        tone: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding padded scroll>
      <View style={styles.header}>
        <Text variant="display">Welcome back</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Sign in to manage your AutoQr tags, vehicles, and incidents.
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
            autoComplete="email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={fieldState.error?.message}
            placeholder="you@example.com"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Password"
            secureTextEntry
            autoComplete="password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={fieldState.error?.message}
            placeholder="••••••••"
          />
        )}
      />

      <Link href="/(auth)/forgot" asChild>
        <Text variant="smallMedium" style={[textStyles.link, styles.forgot]}>
          Forgot password?
        </Text>
      </Link>

      <Button
        label="Sign in"
        onPress={handleSubmit(onSubmit)}
        loading={submitting || formState.isSubmitting}
      />

      <View style={styles.footer}>
        <Text variant="body" muted>
          Don't have an account?{" "}
        </Text>
        <Link href="/(auth)/register" asChild>
          <Text variant="bodyMedium" color={colors.primary}>
            Create one
          </Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xxxl, marginTop: spacing.xl },
  forgot: { alignSelf: "flex-end", marginBottom: spacing.lg },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl
  }
});
