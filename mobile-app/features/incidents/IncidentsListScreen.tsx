import React from "react";
import { StyleSheet, View } from "react-native";
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
import { useIncidentsQuery } from "@/hooks/useIncidentsQuery";
import { colors, radius, spacing } from "@/theme";
import { formatRelative } from "@/utils/format";
import type { Incident } from "@/types/domain";

const statusTone: Record<Incident["status"], "success" | "warning" | "info" | "danger"> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  escalated: "danger"
};

export function IncidentsListScreen() {
  const { data, isLoading, isError, refetch, isRefetching } = useIncidentsQuery();
  return (
    <Screen onRefresh={() => void refetch()} refreshing={isRefetching}>
      <Header title="Incidents" showBack={false} />
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorView onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="shield-checkmark-outline"
          title="No incidents"
          message="When someone scans your AutoQr to report an issue, it'll appear here."
        />
      ) : (
        <View style={styles.list}>
          {data.map((incident) => (
            <IncidentCard key={incident.id} incident={incident} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function IncidentCard({ incident }: { incident: Incident }) {
  return (
    <Card
      padding="xxl"
      onPress={() =>
        router.push({ pathname: "/incidents/[id]", params: { id: incident.id } })
      }
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name="alert-circle-outline" size={22} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {incident.reporterName ?? "Anonymous"}{" "}
            <Text variant="body" muted>
              · {formatRelative(incident.createdAt)}
            </Text>
          </Text>
          {incident.message ? (
            <Text variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>
              {incident.message}
            </Text>
          ) : null}
          <View style={styles.meta}>
            <Badge label={incident.status} tone={statusTone[incident.status]} />
            {incident.images && incident.images.length > 0 ? (
              <Badge label={`${incident.images.length} photo${incident.images.length > 1 ? "s" : ""}`} />
            ) : null}
            {incident.escalationFlag ? <Badge label="Escalated" tone="danger" /> : null}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSubtle} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  },
  meta: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.xs, flexWrap: "wrap" }
});
