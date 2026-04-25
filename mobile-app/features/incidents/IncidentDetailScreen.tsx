import React from "react";
import { Image, ScrollView, StyleSheet, View } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
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
import { useIncidentQuery } from "@/hooks/useIncidentsQuery";
import { colors, radius, spacing } from "@/theme";
import { formatDateTime, formatDuration, maskPhone } from "@/utils/format";
import { resolveAssetUrl } from "@/constants/config";
import { callbacksService } from "@/services/api/callbacks.service";
import { QueryKeys } from "@/constants/queryKeys";
import type { CallSession, Incident } from "@/types/domain";

const statusTone: Record<Incident["status"], "success" | "warning" | "info" | "danger"> = {
  open: "warning",
  in_review: "info",
  resolved: "success",
  escalated: "danger"
};

export function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading, isError, refetch } = useIncidentQuery(id);
  const queryClient = useQueryClient();
  const callbackMutation = useMutation({
    mutationFn: async () => {
      const requested = await callbacksService.request(id as string);
      return callbacksService.start(requested.callback._id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QueryKeys.callbacks });
    }
  });

  if (isLoading) {
    return (
      <Screen>
        <Header title="Incident" />
        <Loader />
      </Screen>
    );
  }
  if (isError || !data) {
    return (
      <Screen>
        <Header title="Incident" />
        <ErrorView onRetry={() => void refetch()} />
      </Screen>
    );
  }

  const { incident, calls } = data;

  return (
    <Screen onRefresh={() => void refetch()}>
      <Header title="Incident" />

      <Card>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text variant="h2">{incident.reporterName ?? "Anonymous reporter"}</Text>
            <Text variant="small" muted>
              {maskPhone(incident.reporterPhone)} · {formatDateTime(incident.createdAt)}
            </Text>
          </View>
          <Badge label={incident.status} tone={statusTone[incident.status]} />
        </View>

        {incident.message ? (
          <View style={styles.messageBox}>
            <Text variant="body">{incident.message}</Text>
          </View>
        ) : null}

        <View style={styles.stats}>
          <StatRow
            icon="car-outline"
            label="Vehicle"
            value={incident.car ? `${incident.car.registrationNumber}` : "—"}
          />
          <StatRow
            icon="phone-portrait-outline"
            label="Platform"
            value={incident.callPlatform ?? "web"}
          />
          <StatRow
            icon="calendar-outline"
            label="Reported"
            value={formatDateTime(incident.createdAt)}
          />
        </View>
        <View style={{ marginTop: spacing.lg }}>
          <Button
            label={callbackMutation.isPending ? "Starting callback..." : "Call Back"}
            onPress={() => callbackMutation.mutate()}
            loading={callbackMutation.isPending}
            disabled={callbackMutation.isPending}
          />
        </View>
      </Card>

      {incident.images && incident.images.length > 0 ? (
        <Card>
          <Text variant="h3">Photos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gallery}>
            {incident.images.map((img, idx) => {
              const uri = resolveAssetUrl(img);
              if (!uri) return null;
              return (
                <Image
                  key={`${img}-${idx}`}
                  source={{ uri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              );
            })}
          </ScrollView>
        </Card>
      ) : null}

      <Card>
        <Text variant="h3">Call timeline</Text>
        {calls.length === 0 ? (
          <Text variant="body" muted style={{ marginTop: spacing.sm }}>
            No calls yet for this incident.
          </Text>
        ) : (
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            {calls.map((call) => (
              <CallRow key={call.id} call={call} />
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function CallRow({ call }: { call: CallSession }) {
  const statusTone: Record<string, "success" | "warning" | "info" | "danger"> = {
    connected: "success",
    accepted: "info",
    ringing: "info",
    ended: "info",
    missed: "warning",
    declined: "danger",
    rejected: "danger",
    failed: "danger",
    cancelled: "warning"
  };
  return (
    <View style={styles.callRow}>
      <View style={styles.callIcon}>
        <Ionicons name="call-outline" size={18} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{maskPhone(call.reporterPhone)}</Text>
        <Text variant="small" muted>
          {formatDateTime(call.startedAt ?? call.createdAt)} · {formatDuration(call.duration)}
        </Text>
      </View>
      <Badge label={call.status} tone={statusTone[call.status] ?? "info"} />
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center" },
  messageBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceAlt
  },
  stats: { marginTop: spacing.sm },
  gallery: { gap: spacing.sm, paddingVertical: spacing.md },
  image: { width: 160, height: 160, borderRadius: radius.lg, backgroundColor: colors.surfaceAlt },
  callRow: { flexDirection: "row", alignItems: "center" },
  callIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md
  }
});
