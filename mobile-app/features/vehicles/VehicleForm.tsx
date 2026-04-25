import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Text } from "@/components/ui";
import { vehicleSchema, type VehicleValues } from "@/schemas/vehicle.schema";
import { colors, radius, spacing } from "@/theme";
import { VEHICLE_COMPANIES, VEHICLE_MODELS, VEHICLE_YEARS } from "./vehicleOptions";

type Props = {
  initialValues?: Partial<VehicleValues>;
  submitLabel?: string;
  submitting?: boolean;
  onSubmit: (values: VehicleValues) => void;
  footer?: React.ReactNode;
};

export function VehicleForm({
  initialValues,
  submitLabel = "Save vehicle",
  submitting,
  onSubmit,
  footer
}: Props) {
  const { control, handleSubmit, setValue, watch } = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: "",
      make: "",
      model: "",
      color: "",
      year: undefined,
      nickname: "",
      displayMessage: "",
      ...initialValues
    }
  });
  const makeValue = watch("make") ?? "";
  const modelValue = watch("model") ?? "";
  const yearValue = watch("year");
  const yearText = yearValue === undefined ? "" : String(yearValue);
  const [makeIsOther, setMakeIsOther] = useState(makeValue.length > 0 && !VEHICLE_COMPANIES.includes(makeValue as (typeof VEHICLE_COMPANIES)[number]));
  const [modelIsOther, setModelIsOther] = useState(modelValue.length > 0 && !VEHICLE_MODELS.includes(modelValue as (typeof VEHICLE_MODELS)[number]));
  const [yearIsOther, setYearIsOther] = useState(yearText.length > 0 && !VEHICLE_YEARS.includes(yearText));

  useEffect(() => {
    if (!makeValue) return;
    if (!VEHICLE_COMPANIES.includes(makeValue as (typeof VEHICLE_COMPANIES)[number])) setMakeIsOther(true);
  }, [makeValue]);

  useEffect(() => {
    if (!modelValue) return;
    if (!VEHICLE_MODELS.includes(modelValue as (typeof VEHICLE_MODELS)[number])) setModelIsOther(true);
  }, [modelValue]);

  useEffect(() => {
    if (!yearText) return;
    if (!VEHICLE_YEARS.includes(yearText)) setYearIsOther(true);
  }, [yearText]);

  return (
    <View>
      <Controller
        control={control}
        name="registrationNumber"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Registration number"
            autoCapitalize="characters"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            placeholder="M-AB 1234"
          />
        )}
      />
      <View style={styles.row}>
        <View style={styles.cell}>
          <Text variant="smallMedium" muted style={styles.fieldLabel}>
            Make
          </Text>
          <View style={styles.optionsWrap}>
            {VEHICLE_COMPANIES.map((company) => {
              const active = makeValue === company;
              return (
                <Pressable
                  key={company}
                  style={[styles.optionChip, active ? styles.optionChipActive : null]}
                  onPress={() => {
                    setMakeIsOther(false);
                    setValue("make", company, { shouldValidate: true });
                  }}
                >
                  <Text variant="small" color={active ? colors.primary : colors.text}>
                    {company}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.optionChip, makeIsOther ? styles.optionChipActive : null]}
              onPress={() => {
                setMakeIsOther(true);
                setValue("make", "", { shouldValidate: true });
              }}
            >
              <Text variant="small" color={makeIsOther ? colors.primary : colors.text}>
                Other
              </Text>
            </Pressable>
          </View>
          {makeIsOther ? (
          <Controller
            control={control}
            name="make"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Make"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                placeholder="BMW"
              />
            )}
          />
          ) : null}
        </View>
        <View style={styles.cell}>
          <Text variant="smallMedium" muted style={styles.fieldLabel}>
            Model
          </Text>
          <View style={styles.optionsWrap}>
            {VEHICLE_MODELS.map((model) => {
              const active = modelValue === model;
              return (
                <Pressable
                  key={model}
                  style={[styles.optionChip, active ? styles.optionChipActive : null]}
                  onPress={() => {
                    setModelIsOther(false);
                    setValue("model", model, { shouldValidate: true });
                  }}
                >
                  <Text variant="small" color={active ? colors.primary : colors.text}>
                    {model}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.optionChip, modelIsOther ? styles.optionChipActive : null]}
              onPress={() => {
                setModelIsOther(true);
                setValue("model", "", { shouldValidate: true });
              }}
            >
              <Text variant="small" color={modelIsOther ? colors.primary : colors.text}>
                Other
              </Text>
            </Pressable>
          </View>
          {modelIsOther ? (
          <Controller
            control={control}
            name="model"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Model"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                placeholder="M3"
              />
            )}
          />
          ) : null}
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.cell}>
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Color"
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                placeholder="Alpine white"
              />
            )}
          />
        </View>
        <View style={styles.cell}>
          <Text variant="smallMedium" muted style={styles.fieldLabel}>
            Year
          </Text>
          <View style={styles.optionsWrap}>
            {VEHICLE_YEARS.map((year) => {
              const active = yearText === year;
              return (
                <Pressable
                  key={year}
                  style={[styles.optionChip, active ? styles.optionChipActive : null]}
                  onPress={() => {
                    setYearIsOther(false);
                    setValue("year", Number(year), { shouldValidate: true });
                  }}
                >
                  <Text variant="small" color={active ? colors.primary : colors.text}>
                    {year}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              style={[styles.optionChip, yearIsOther ? styles.optionChipActive : null]}
              onPress={() => {
                setYearIsOther(true);
                setValue("year", undefined, { shouldValidate: true });
              }}
            >
              <Text variant="small" color={yearIsOther ? colors.primary : colors.text}>
                Other
              </Text>
            </Pressable>
          </View>
          {yearIsOther ? (
          <Controller
            control={control}
            name="year"
            render={({ field: { onChange, onBlur, value }, fieldState }) => (
              <Input
                label="Year"
                keyboardType="number-pad"
                value={value ? String(value) : ""}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldState.error?.message}
                placeholder="2024"
              />
            )}
          />
          ) : null}
        </View>
      </View>
      <Controller
        control={control}
        name="nickname"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Nickname (optional)"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            placeholder="Weekend car"
          />
        )}
      />
      <Controller
        control={control}
        name="displayMessage"
        render={({ field: { onChange, onBlur, value }, fieldState }) => (
          <Input
            label="Public message"
            helperText="Shown when someone scans your QR"
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            error={fieldState.error?.message}
            placeholder="Please call me if something is wrong."
            multiline
            numberOfLines={3}
          />
        )}
      />
      <Text variant="caption" muted style={styles.notice}>
        AutoQr is for personal cars only.
      </Text>
      <Button label={submitLabel} onPress={handleSubmit(onSubmit)} loading={submitting} />
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: spacing.md },
  cell: { flex: 1 },
  notice: { marginBottom: spacing.lg },
  fieldLabel: { marginBottom: spacing.xs },
  optionsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  }
});
