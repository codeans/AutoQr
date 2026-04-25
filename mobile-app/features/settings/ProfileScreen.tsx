import React from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Header, Input, Screen, Text } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useUpdateProfileMutation } from "@/hooks/useProfileQuery";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import { profileSchema, type ProfileValues } from "@/schemas/profile.schema";
import { spacing } from "@/theme";

export function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const mutation = useUpdateProfileMutation();
  const pushToast = useAppStore((s) => s.pushToast);

  const { control, handleSubmit } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? ""
    }
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      await mutation.mutateAsync({
        name: values.name.trim(),
        phone: values.phone?.trim() || undefined,
        address: values.address?.trim() || undefined
      });
      pushToast({ title: "Profile updated", tone: "success" });
    } catch (err) {
      pushToast({ title: "Update failed", message: extractErrorMessage(err), tone: "danger" });
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Profile" />
      <Text variant="small" muted style={{ marginBottom: spacing.lg }}>
        Email: {user?.email}
      </Text>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Name"
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
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="address"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Address"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            multiline
            numberOfLines={3}
          />
        )}
      />
      <Button
        label="Save changes"
        onPress={handleSubmit(onSubmit)}
        loading={mutation.isPending}
      />
    </Screen>
  );
}
