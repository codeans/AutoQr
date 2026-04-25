import React, { useCallback, useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Header, Text, EmptyState, Loader } from "@/components/ui";
import { QueryKeys } from "@/constants/queryKeys";
import { colors, radius, spacing } from "@/theme";
import { callsService, type CallHistoryItem, type CallStatus } from "@/services/api/calls.service";
import { CallStatusBadge } from "./CallStatusBadge";
import { formatDateTime, formatDuration } from "@/utils/format";
import { callbacksService } from "@/services/api/callbacks.service";

type FilterKey = "all" | "missed" | "accepted";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "missed", label: "Missed" },
  { key: "accepted", label: "Accepted" }
];

const iconForStatus = (status: CallStatus): keyof typeof Ionicons.glyphMap => {
  if (status === "missed" || status === "cancelled") return "call-outline";
  if (status === "declined" || status === "rejected" || status === "failed") return "close-circle";
  return "call";
};

const tintForStatus = (status: CallStatus): string => {
  if (status === "missed" || status === "declined" || status === "rejected" || status === "failed") return colors.danger;
  if (status === "ended" || status === "cancelled") return colors.textSubtle;
  return colors.success;
};

type Props = { defaultFilter?: FilterKey };

export function CallHistoryScreen({ defaultFilter = "all" }: Props) {
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
  const [filter, setFilter] = React.useState<FilterKey>(defaultFilter);

  const query = useQuery({
    queryKey: QueryKeys.calls,
    queryFn: () => callsService.list().then((r) => r.calls)
  });

  const filtered = useMemo(() => {
    const calls = query.data ?? [];
    if (filter === "missed") return calls.filter((c) => c.status === "missed" || c.status === "declined" || c.status === "rejected");
    if (filter === "accepted") return calls.filter((c) => c.status === "ended" || c.status === "connected" || c.status === "accepted");
    return calls;
  }, [filter, query.data]);

  const onRefresh = useCallback(() => query.refetch(), [query]);

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.padded}>
        <Header title="Call history" subtitle={filter === "missed" ? "Missed calls" : undefined} />
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.key === filter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.filterBtn, active && styles.filterBtnActive]}
              >
                <Text
                  variant="smallMedium"
                  style={{ color: active ? colors.textInverse : colors.text }}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(c) => c._id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        renderItem={({ item }) => (
          <CallRow item={item} onCallback={(incidentId) => callbackMutation.mutate(incidentId)} isCallbackLoading={callbackMutation.isPending} />
        )}
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.loaderWrap}>
              <Loader />
            </View>
          ) : (
            <EmptyState
              icon="call-outline"
              title={filter === "missed" ? "No missed calls" : "No calls yet"}
              message={
                filter === "missed"
                  ? "Calls you couldn't answer will appear here."
                  : "Your past incident calls will appear here once someone scans your AutoQr tag."
              }
            />
          )
        }
      />
    </SafeAreaView>
  );
}

function CallRow({
  item,
  onCallback,
  isCallbackLoading
}: {
  item: CallHistoryItem;
  onCallback: (incidentId: string) => void;
  isCallbackLoading: boolean;
}) {
  const iconName = iconForStatus(item.status);
  const tint = tintForStatus(item.status);
  const label = item.reporterPhoneMasked || "Unknown caller";
  const when = formatDateTime(item.endedAt || item.createdAt);
  const duration =
    item.duration && item.duration > 0 ? formatDuration(item.duration) : item.status === "missed" ? "Missed" : "—";

  return (
    <Pressable
      onPress={() => item.incidentId && router.push(`/incidents/${item.incidentId}`)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
        <Ionicons name={iconName} size={20} color={tint} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text variant="bodyMedium" numberOfLines={1}>
            {label}
          </Text>
          <Text variant="caption" muted>
            {duration}
          </Text>
        </View>
        <View style={styles.rowMeta}>
          <CallStatusBadge status={item.status} />
          <Text variant="caption" muted>
            {when}
          </Text>
        </View>
        {(item.status === "missed" || item.status === "declined" || item.status === "rejected") && item.incidentId ? (
          <Pressable onPress={() => onCallback(item.incidentId)} style={styles.callbackBtn}>
            <Text variant="caption" style={{ color: colors.primary }}>
              {isCallbackLoading ? "Calling..." : "Return Call"}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: spacing.xxl },
  filterRow: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.lg
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: radius.pill
  },
  filterBtnActive: { backgroundColor: colors.primary },
  listContent: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge, flexGrow: 1 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.sm },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  rowBody: { flex: 1, gap: 4 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.sm },
  callbackBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 4
  },
  loaderWrap: { paddingVertical: spacing.xxl, alignItems: "center" }
});
