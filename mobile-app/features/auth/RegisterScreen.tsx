import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Screen, Text } from "@/components/ui";
import { registerSchema, type RegisterValues } from "@/schemas/auth.schema";
import { useAppStore } from "@/stores/app.store";
import { useAuthStore } from "@/stores/auth.store";
import { extractErrorMessage } from "@/utils/errors";
import { colors, spacing } from "@/theme";
import { AuthApi } from "@/services/api";

export function RegisterScreen() {
  const [submitting, setSubmitting] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const pushToast = useAppStore((s) => s.pushToast);
  const [step, setStep] = useState<"details" | "verify">("details");
  const [pendingSignup, setPendingSignup] = useState<RegisterValues | null>(null);
  const [code, setCode] = useState("");
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

  const onSubmitDetails = async (values: RegisterValues) => {
    setSubmitting(true);
    try {
      await AuthApi.sendWhatsAppOtp({ phone: values.phone.trim(), purpose: "signup" });
      setPendingSignup(values);
      setStep("verify");
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

  const onVerify = async () => {
    if (!pendingSignup) return;
    setSubmitting(true);
    try {
      const res = await AuthApi.verifyWhatsAppOtp({
        phone: pendingSignup.phone.trim(),
        code: code.trim(),
        purpose: "signup",
        signup: {
          name: pendingSignup.name.trim(),
          email: pendingSignup.email.trim(),
          address: pendingSignup.address?.trim() || "",
          password: pendingSignup.password
        }
      });
      setUser(res.user);
      router.replace("/activate");
    } catch (err) {
      pushToast({
        title: "Verification failed",
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
        <Text variant="display">{step === "details" ? "Create account" : "Verify WhatsApp OTP"}</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          {step === "details"
            ? "Enter your details and we’ll verify your phone with WhatsApp."
            : "Enter the 6-digit code sent to your phone."}
        </Text>
      </View>

      {step === "details" ? (
        <>
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

          <Button label="Send code" onPress={handleSubmit(onSubmitDetails)} loading={submitting} />
        </>
      ) : (
        <>
          <Input
            label="OTP code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            value={code}
            onChangeText={setCode}
            placeholder="e.g. 123456"
          />
          <Button label="Verify & continue" onPress={onVerify} loading={submitting} />
          <Button label="Back" onPress={() => setStep("details")} disabled={submitting} variant="secondary" />
        </>
      )}

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
