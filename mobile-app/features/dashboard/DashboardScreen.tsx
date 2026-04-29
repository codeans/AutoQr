import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  Header,
  Loader,
  Screen,
  Text
} from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useCarsQuery } from "@/hooks/useCarsQuery";
import { useIncidentsQuery } from "@/hooks/useIncidentsQuery";
import { useNotificationStore } from "@/stores/notification.store";
import { formatRelative, carLabel } from "@/utils/format";
import { colors, radius, spacing } from "@/theme";
import { callbacksService } from "@/services/api/callbacks.service";
import { QueryKeys } from "@/constants/queryKeys";

export function DashboardScreen() {
  const queryClient = useQueryClient();
  const callbackMutation = useMutation({
    mutationFn: async (incidentId: string) => {
      const requested = await callbacksService.request(incidentId);
      return callbacksService.start(requested.callback._id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.callbacks });
    }
  });
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const { data: cars, isLoading: carsLoading, refetch: refetchCars } = useCarsQuery();
  const {
    data: incidents,
    isLoading: incidentsLoading,
    refetch: refetchIncidents
  } = useIncidentsQuery();
  const unreadNotifications = useNotificationStore((s) => s.unreadCount);

  const primaryCar = useMemo(
    () => cars?.find((c) => c.isPrimary) ?? cars?.[0] ?? null,
    [cars]
  );
  const activatedCount = cars?.filter((c) => c.activationStatus === "activated").length ?? 0;
  const recentIncidents = useMemo(() => (incidents ?? []).slice(0, 3), [incidents]);

  const onRefresh = async () => {
    await Promise.allSettled([refetchCars(), refetchIncidents()]);
  };

  return (
    <Screen onRefresh={onRefresh}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text variant="small" muted>
              {t("dashboard.welcomeBack")}
            </Text>
            <Text variant="display">{user?.name ?? (t("dashboard.there") as string)}</Text>
          </View>
          <View style={styles.heroActions}>
            <Pressable
              onPress={() => router.push("/notifications")}
              hitSlop={10}
              style={({ pressed }) => [styles.bellBtn, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
              {unreadNotifications > 0 ? (
                <View style={styles.bellBadge}>
                  <Text
                    variant="caption"
                    style={{ color: colors.textInverse, fontSize: 10, lineHeight: 12 }}
                  >
                    {unreadNotifications > 9 ? "9+" : String(unreadNotifications)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
      </View>

      {carsLoading || incidentsLoading ? (
        <Loader />
      ) : (
        <>
          <View style={styles.statsRow}>
            <StatCard
              icon="car-sport-outline"
              label={t("dashboard.summary.vehicles") as string}
              value={String(cars?.length ?? 0)}
              onPress={() => router.push("/(tabs)/vehicles")}
            />
            <StatCard
              icon="shield-checkmark-outline"
              label={t("dashboard.activatedLabel") as string}
              value={String(activatedCount)}
            />
            <StatCard
              icon="alert-circle-outline"
              label={t("dashboard.summary.incidents") as string}
              value={String(incidents?.length ?? 0)}
              onPress={() => router.push("/(tabs)/incidents")}
            />
          </View>

          <Card>
            <Text variant="h3">{t("dashboard.primaryVehicle")}</Text>
            {primaryCar ? (
              <View style={{ marginTop: spacing.md }}>
                <View style={styles.primaryRow}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium">{carLabel(primaryCar)}</Text>
                    <Text variant="small" muted>
                      {primaryCar.registrationNumber}
                    </Text>
                  </View>
                  <Badge
                    tone={primaryCar.activationStatus === "activated" ? "success" : "warning"}
                    label={primaryCar.activationStatus}
                  />
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
                  <Button
                    label="Open"
                    variant="secondary"
                    onPress={() =>
                      router.push({
                        pathname: "/vehicles/[id]",
                        params: { id: primaryCar.id }
                      })
                    }
                  />
                  {primaryCar.activationStatus !== "activated" ? (
                    <Button label="Activate QR" onPress={() => router.push("/activate")} />
                  ) : null}
                </View>
              </View>
            ) : (
              <View style={{ marginTop: spacing.md }}>
                <Text variant="body" muted>
                  You haven't added a vehicle yet.
                </Text>
                <Button
                  label="Add vehicle"
                  onPress={() => router.push("/vehicles/new")}
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            )}
          </Card>

          <Card>
            <View style={styles.sectionHead}>
              <Text variant="h3">Recent incidents</Text>
              {incidents && incidents.length > 0 ? (
                <Text
                  variant="smallMedium"
                  color={colors.primary}
                  onPress={() => router.push("/(tabs)/incidents")}
                >
                  View all
                </Text>
              ) : null}
            </View>
            {recentIncidents.length === 0 ? (
              <Text variant="body" muted style={{ marginTop: spacing.sm }}>
                No incidents yet. You're all clear.
              </Text>
            ) : (
              <View style={{ marginTop: spacing.sm }}>
                {recentIncidents.map((i, index) => (
                  <View
                    key={i.id ?? `${i.createdAt ?? "incident"}-${i.status}-${index}`}
                    style={styles.incidentRow}
                  >
                    <View style={styles.incidentDot} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium" numberOfLines={1}>
                        {i.reporterName ?? "Someone"} reported an incident
                      </Text>
                      <Text variant="small" muted>
                        {formatRelative(i.createdAt)}
                      </Text>
                    </View>
                    <Badge
                      label={i.status}
                      tone={i.status === "resolved" ? "success" : "warning"}
                    />
                    {i.id ? (
                      <Pressable onPress={() => callbackMutation.mutate(i.id)} style={styles.contactBtn}>
                        <Text variant="caption" style={{ color: colors.primary }}>
                          Contact Reporter
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
              </View>
            )}
          </Card>

          <Card>
            <Text variant="h3">Quick actions</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              <ActionRow
                icon="qr-code-outline"
                label="Activate QR tag"
                onPress={() => router.push("/activate")}
              />
              <ActionRow
                icon="car-outline"
                label="Add vehicle"
                onPress={() => router.push("/vehicles/new")}
              />
              <ActionRow
                icon="help-circle-outline"
                label="Get support"
                onPress={() => router.push("/settings/support")}
              />
            </View>
          </Card>
        </>
      )}
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Card onPress={onPress} padding="lg" style={styles.statCard}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text variant="h2" style={{ marginTop: spacing.sm }}>
        {value}
      </Text>
      <Text variant="caption" muted>
        {label}
      </Text>
    </Card>
  );
}

function ActionRow({
  icon,
  label,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Card onPress={onPress} padding="lg" tone="soft">
      <View style={styles.actionRow}>
        <Ionicons name={icon} size={22} color={colors.primary} />
        <Text variant="bodyMedium" style={{ flex: 1, marginLeft: spacing.md }}>
          {label}
        </Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: spacing.xl },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroActions: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  bellBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center"
  },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  statCard: { flex: 1, alignItems: "flex-start" },
  primaryRow: { flexDirection: "row", alignItems: "center" },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  incidentRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm
  },
  incidentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: spacing.md
  },
  contactBtn: {
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  actionRow: { flexDirection: "row", alignItems: "center" }
});
