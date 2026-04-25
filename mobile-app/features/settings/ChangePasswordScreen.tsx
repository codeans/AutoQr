import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Header, Input, Screen } from "@/components/ui";
import { changePasswordSchema, type ChangePasswordValues } from "@/schemas/auth.schema";
import { AuthApi } from "@/services/api";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";

export function ChangePasswordScreen() {
  const [submitting, setSubmitting] = useState(false);
  const pushToast = useAppStore((s) => s.pushToast);
  const { control, handleSubmit, reset } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    setSubmitting(true);
    try {
      await AuthApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      pushToast({ title: "Password updated", tone: "success" });
      reset();
    } catch (err) {
      pushToast({
        title: "Couldn't update password",
        message: extractErrorMessage(err),
        tone: "danger"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Change password" />
      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Current password"
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
        name="newPassword"
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
            label="Confirm new password"
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
