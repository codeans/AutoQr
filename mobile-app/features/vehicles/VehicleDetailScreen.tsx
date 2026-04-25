import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  Badge,
  Button,
  Card,
  ErrorView,
  Header,
  Loader,
  Screen,
  StatRow,
  Text
} from "@/components/ui";
import { VehicleForm } from "./VehicleForm";
import {
  useCarQuery,
  useDeleteCarMutation,
  useSetPrimaryCarMutation,
  useUpdateCarMutation
} from "@/hooks/useCarsQuery";
import { CarsApi } from "@/services/api";
import { carLabel, formatDate } from "@/utils/format";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import { colors, radius, spacing } from "@/theme";
import type { VehicleValues } from "@/schemas/vehicle.schema";

export function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: car, isLoading, isError, refetch } = useCarQuery(id);
  const update = useUpdateCarMutation();
  const del = useDeleteCarMutation();
  const primary = useSetPrimaryCarMutation();
  const pushToast = useAppStore((s) => s.pushToast);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (isLoading) {
    return (
      <Screen>
        <Header title="Vehicle" />
        <Loader />
      </Screen>
    );
  }
  if (isError || !car) {
    return (
      <Screen>
        <Header title="Vehicle" />
        <ErrorView onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const onSave = async (values: VehicleValues) => {
    try {
      await update.mutateAsync({
        id: car.id,
        input: {
          registrationNumber: values.registrationNumber,
          make: values.make || undefined,
          model: values.model || undefined,
          color: values.color || undefined,
          year: values.year ?? undefined,
          nickname: values.nickname || undefined,
          displayMessage: values.displayMessage || undefined
        }
      });
      pushToast({ title: "Vehicle updated", tone: "success" });
      setEditing(false);
    } catch (err) {
      pushToast({ title: "Update failed", message: extractErrorMessage(err), tone: "danger" });
    }
  };

  const onUploadImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      pushToast({ title: "Permission needed", tone: "warning" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true
    });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      await CarsApi.uploadPlateImage(car.id, {
        uri: asset.uri,
        name: asset.fileName ?? `plate-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg"
      });
      pushToast({ title: "Photo updated", tone: "success" });
      refetch();
    } catch (err) {
      pushToast({ title: "Upload failed", message: extractErrorMessage(err), tone: "danger" });
    } finally {
      setUploading(false);
    }
  };

  const onDelete = () => {
    Alert.alert(
      "Remove vehicle?",
      "This will remove the vehicle from your account. Any active QR link will be cleared.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await del.mutateAsync(car.id);
              pushToast({ title: "Vehicle removed", tone: "info" });
              router.back();
            } catch (err) {
              pushToast({
                title: "Couldn't remove",
                message: extractErrorMessage(err),
                tone: "danger"
              });
            }
          }
        }
      ]
    );
  };

  return (
    <Screen onRefresh={() => void refetch()}>
      <Header title={carLabel(car)} />

      {editing ? (
        <VehicleForm
          submitLabel="Save changes"
          submitting={update.isPending}
          initialValues={{
            registrationNumber: car.registrationNumber,
            make: car.make ?? "",
            model: car.model ?? "",
            color: car.color ?? "",
            year: car.year ?? undefined,
            nickname: car.nickname ?? "",
            displayMessage: car.displayMessage ?? ""
          }}
          onSubmit={onSave}
          footer={
            <Button
              label="Cancel"
              variant="ghost"
              onPress={() => setEditing(false)}
              style={{ marginTop: spacing.md }}
            />
          }
        />
      ) : (
        <>
          <Card>
            <View style={styles.headerRow}>
              <View style={styles.iconWrap}>
                <Ionicons name="car-sport" size={26} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h2">{carLabel(car)}</Text>
                <Text variant="small" muted style={{ marginTop: 2 }}>
                  {car.registrationNumber}
                </Text>
              </View>
            </View>
            <View style={styles.badgeRow}>
              <Badge
                label={car.activationStatus}
                tone={car.activationStatus === "activated" ? "success" : "warning"}
              />
              {car.activeTagId ? <Badge label="QR linked" tone="primary" /> : null}
              {car.isPrimary ? <Badge label="Primary" tone="info" /> : null}
            </View>
            <View style={styles.stats}>
              <StatRow icon="color-palette-outline" label="Color" value={car.color ?? "—"} />
              <StatRow icon="calendar-outline" label="Year" value={car.year ? String(car.year) : "—"} />
              <StatRow
                icon="time-outline"
                label="Created"
                value={formatDate(car.createdAt)}
              />
            </View>
          </Card>

          <View style={styles.actions}>
            <Button label="Edit details" onPress={() => setEditing(true)} />
            <Button
              label={uploading ? "Uploading..." : "Upload plate photo"}
              variant="secondary"
              onPress={onUploadImage}
              loading={uploading}
            />
            {!car.isPrimary ? (
              <Button
                label="Set as primary"
                variant="ghost"
                onPress={() => primary.mutate(car.id)}
                loading={primary.isPending}
              />
            ) : null}
            {!car.activeTagId ? (
              <Button
                label="Activate QR tag"
                variant="secondary"
                onPress={() => router.push("/activate")}
              />
            ) : null}
            <Button label="Remove vehicle" variant="danger" onPress={onDelete} />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg
  },
  badgeRow: { flexDirection: "row", marginTop: spacing.lg, gap: spacing.sm, flexWrap: "wrap" },
  stats: { marginTop: spacing.sm },
  actions: { marginTop: spacing.xl, gap: spacing.md }
});
