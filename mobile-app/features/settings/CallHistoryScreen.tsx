import React from "react";
import { StyleSheet, View } from "react-native";
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
import { useCallHistoryQuery } from "@/hooks/useIncidentsQuery";
import { formatDateTime, formatDuration, maskPhone } from "@/utils/format";
import { colors, radius, spacing } from "@/theme";

export function CallHistoryScreen() {
  const { data, isLoading, isError, refetch } = useCallHistoryQuery();

  return (
    <Screen onRefresh={() => void refetch()}>
      <Header title="Call history" />
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <ErrorView onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon="call-outline"
          title="No calls yet"
          message="Calls made through AutoQr will appear here."
        />
      ) : (
        <View style={{ gap: spacing.md }}>
          {data.map((call) => (
            <Card key={call.id} padding="lg">
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name="call-outline" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">{maskPhone(call.reporterPhone)}</Text>
                  <Text variant="small" muted>
                    {formatDateTime(call.startedAt ?? call.createdAt)} ·{" "}
                    {formatDuration(call.duration)}
                  </Text>
                </View>
                <Badge
                  label={call.status}
                  tone={
                    call.status === "connected" || call.status === "accepted"
                      ? "success"
                      : call.status === "missed"
                        ? "warning"
                        : call.status === "declined" || call.status === "rejected"
                          ? "danger"
                          : "neutral"
                  }
                />
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  }
});
