import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  Badge,
  Card,
  EmptyState,
  ErrorView,
  Header,
  Loader,
  Screen,
  Text
} from "@/components/ui";
import { useCarsQuery } from "@/hooks/useCarsQuery";
import { carLabel } from "@/utils/format";
import { colors, radius, spacing } from "@/theme";
import type { Car } from "@/types/domain";

export function VehiclesListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useCarsQuery();

  const handleAdd = useCallback(() => router.push("/vehicles/new"), []);

  return (
    <Screen
      onRefresh={() => void refetch()}
      refreshing={isRefetching}
    >
      <Header
        title="Vehicles"
        showBack={false}
        right={
          <Pressable onPress={handleAdd} hitSlop={12}>
            <Ionicons name="add-circle" size={28} color={colors.primary} />
          </Pressable>
        }
      />

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorView onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="car-sport-outline"
          title="No vehicles yet"
          message="Add your first car to start protecting it with AutoQr."
          actionLabel="Add vehicle"
          onAction={handleAdd}
        />
      ) : (
        <View style={styles.list}>
          {data.map((car) => (
            <VehicleCard key={car.id} car={car} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function VehicleCard({ car }: { car: Car }) {
  return (
    <Card
      onPress={() => router.push({ pathname: "/vehicles/[id]", params: { id: car.id } })}
      padding="xxl"
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="car-sport" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Text variant="h3">{carLabel(car)}</Text>
            {car.isPrimary ? <Badge label="Primary" tone="primary" /> : null}
          </View>
          <Text variant="small" muted style={{ marginTop: 2 }}>
            {car.registrationNumber}
          </Text>
          <View style={styles.meta}>
            <Badge
              label={car.activationStatus}
              tone={car.activationStatus === "activated" ? "success" : "warning"}
            />
            {car.activeTagId ? <Badge label="QR linked" tone="primary" /> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSubtle} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  meta: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.xs },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.lg
  }
});
