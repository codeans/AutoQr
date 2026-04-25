import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ionicons } from "@expo/vector-icons";
import {
  Badge,
  Button,
  Card,
  Header,
  Input,
  Screen,
  Text
} from "@/components/ui";
import { activationSchema, type ActivationValues } from "@/schemas/activation.schema";
import { TagsApi } from "@/services/api";
import { useCarsQuery } from "@/hooks/useCarsQuery";
import { useAppStore } from "@/stores/app.store";
import { extractErrorMessage } from "@/utils/errors";
import { carLabel } from "@/utils/format";
import { colors, radius, spacing } from "@/theme";
import type { Car } from "@/types/domain";

export function ActivationScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const pushToast = useAppStore((s) => s.pushToast);
  const { data: cars = [] } = useCarsQuery();

  const { control, handleSubmit } = useForm<ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: { activationCode: "" }
  });

  const onSubmit = async (values: ActivationValues) => {
    setSubmitting(true);
    try {
      await TagsApi.activateTag({
        activationCode: values.activationCode,
        carId: selectedCar?.id
      });
      pushToast({
        title: "Tag activated",
        message: selectedCar
          ? `Linked to ${carLabel(selectedCar)}.`
          : "Next: link this tag to a vehicle.",
        tone: "success"
      });
      router.replace("/(tabs)/vehicles");
    } catch (err) {
      pushToast({ title: "Activation failed", message: extractErrorMessage(err), tone: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen keyboardAvoiding>
      <Header title="Activate QR" />
      <View style={styles.intro}>
        <Text variant="display">Activate your AutoQr tag</Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Enter the activation code printed on the card that came with your QR sticker.
        </Text>
      </View>

      <Card>
        <Controller
          control={control}
          name="activationCode"
          render={({ field: { onChange, onBlur, value }, fieldState }) => (
            <Input
              label="Activation code"
              autoCapitalize="characters"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. 7K2P-M9Q3"
              error={fieldState.error?.message}
              leftIcon={<Ionicons name="key-outline" size={20} color={colors.primary} />}
            />
          )}
        />

        <Text variant="smallMedium" muted style={styles.chooseLabel}>
          Link to vehicle (optional)
        </Text>
        <View style={styles.carList}>
          <Card
            tone={selectedCar === null ? "default" : "soft"}
            padding="lg"
            onPress={() => setSelectedCar(null)}
            style={selectedCar === null ? styles.cardSelected : undefined}
          >
            <View style={styles.carRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMedium">Link later</Text>
                <Text variant="small" muted>
                  I'll attach a vehicle after activation
                </Text>
              </View>
              {selectedCar === null ? (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              ) : null}
            </View>
          </Card>

          {cars.map((car) => {
            const active = selectedCar?.id === car.id;
            return (
              <Card
                key={car.id}
                tone={active ? "default" : "soft"}
                padding="lg"
                onPress={() => setSelectedCar(car)}
                style={active ? styles.cardSelected : undefined}
              >
                <View style={styles.carRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{carLabel(car)}</Text>
                    <View style={styles.carMeta}>
                      <Badge
                        tone={car.activationStatus === "activated" ? "success" : "warning"}
                        label={car.activationStatus}
                      />
                    </View>
                  </View>
                  {active ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>

        <Button
          label="Activate tag"
          onPress={handleSubmit(onSubmit)}
          loading={submitting}
          style={styles.submit}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginBottom: spacing.xl },
  chooseLabel: { marginTop: spacing.sm, marginBottom: spacing.sm },
  carList: { gap: spacing.sm, marginBottom: spacing.lg },
  carRow: { flexDirection: "row", alignItems: "center" },
  carMeta: { marginTop: spacing.xs, flexDirection: "row", gap: spacing.xs },
  cardSelected: { borderColor: colors.primary, borderWidth: 2, borderRadius: radius.xl },
  submit: { marginTop: spacing.md }
});
