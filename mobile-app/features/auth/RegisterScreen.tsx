import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Screen, Text } from "@/components/ui";
import { registerSchema, type RegisterValues } from "@/schemas/auth.schema";
import { useAuthActions } from "@/hooks/useAuthActions";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import { colors, spacing } from "@/theme";

export function RegisterScreen() {
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuthActions();
  const pushToast = useAppStore((s) => s.pushToast);
  const { control, handleSubmit } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await register({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        address: values.address?.trim() || undefined,
        password: values.password
      });
      router.replace("/");
    } catch (err) {
      pushToast({
        title: "Couldn't create account",
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
        <Text variant="display">Create account</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Join AutoQr to secure your vehicles with premium QR protection.
        </Text>
      </View>

      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Full name"
            autoComplete="name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
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
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Phone"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="+49 ..."
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Address (optional)"
            autoComplete="postal-address"
            value={value ?? ""}
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
            label="Password"
            secureTextEntry
            autoComplete="password-new"
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
            autoComplete="password-new"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />

      <Button label="Create account" onPress={handleSubmit(onSubmit)} loading={submitting} />

      <View style={styles.footer}>
        <Text variant="body" muted>
          Already have an account?{" "}
        </Text>
        <Link href="/(auth)/login" asChild>
          <Text variant="bodyMedium" color={colors.primary}>
            Sign in
          </Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xxxl, marginTop: spacing.xl },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xl
  }
});
