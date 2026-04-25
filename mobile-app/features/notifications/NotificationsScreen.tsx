import React, { useEffect, useMemo } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Header, Text, EmptyState, Loader } from "@/components/ui";
import { colors, radius, spacing } from "@/theme";
import { useNotifications } from "./useNotifications";
import type { AppNotification } from "@/types/notification";
import { formatRelative } from "@/utils/format";

const iconFor = (type: AppNotification["type"]): { name: keyof typeof Ionicons.glyphMap; tint: string; bg: string } => {
  switch (type) {
    case "INCOMING_CALL":
      return { name: "call", tint: colors.primary, bg: colors.primarySoft };
    case "MISSED_CALL":
    case "call_missed":
      return { name: "call-outline", tint: colors.danger, bg: colors.dangerSoft };
    case "CALL_ENDED":
    case "call_ended":
      return { name: "call-outline", tint: colors.textSubtle, bg: colors.surfaceAlt };
    case "INCIDENT_CREATED":
    case "incident_created":
      return { name: "alert-circle", tint: colors.warning, bg: colors.warningSoft };
    case "QR_ACTIVATED":
      return { name: "qr-code", tint: colors.success, bg: colors.successSoft };
    case "QR_DISPATCHED":
      return { name: "cube", tint: colors.info, bg: colors.infoSoft };
    case "ACCOUNT_UPDATED":
      return { name: "person-circle", tint: colors.primary, bg: colors.primarySoft };
    default:
      return { name: "notifications", tint: colors.textSubtle, bg: colors.surfaceAlt };
  }
};

function navigateFromItem(item: AppNotification): void {
  const type = item.type as string;
  const data = (item.data ?? {}) as Record<string, string | undefined>;
  const relatedId = item.relatedEntityId || data.incidentId;

  if (type === "INCOMING_CALL") {
    if (data.callId) {
      router.push(`/calls/incoming/${data.callId}` as never);
    } else {
      router.push("/call/incoming");
    }
    return;
  }
  if (type === "MISSED_CALL" || type === "call_missed" || type === "CALL_ENDED" || type === "call_ended") {
    router.push("/call/history");
    return;
  }
  if ((type === "INCIDENT_CREATED" || type === "incident_created") && relatedId) {
    router.push(`/incidents/${relatedId}`);
    return;
  }
  if (type === "QR_ACTIVATED" || type === "QR_DISPATCHED") {
    if (data.carId) router.push(`/vehicles/${data.carId}`);
    else router.push("/(tabs)/vehicles");
    return;
  }
}

export function NotificationsScreen() {
  const {
    items,
    loading,
    refreshing,
    error,
    hasMore,
    unreadCount,
    fetchInitial,
    refresh,
    loadMore,
    markOneRead,
    markAllRead
  } = useNotifications();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const headerRight = useMemo(() => {
    if (unreadCount === 0) return null;
    return (
      <Pressable onPress={markAllRead} hitSlop={10}>
        <Text variant="smallMedium" style={{ color: colors.primary }}>
          Read all
        </Text>
      </Pressable>
    );
  }, [unreadCount, markAllRead]);

  const renderItem = ({ item }: { item: AppNotification }) => (
    <NotificationRow
      item={item}
      onPress={() => {
        if (!item.isRead) markOneRead(item.id);
        navigateFromItem(item);
      }}
    />
  );

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.safe}>
      <View style={styles.padded}>
        <Header
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : undefined}
          right={headerRight}
        />
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />
        }
        onEndReached={() => {
          if (hasMore && !loading) loadMore();
        }}
        onEndReachedThreshold={0.3}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListEmptyComponent={
          loading && !refreshing ? (
            <View style={styles.loaderWrap}>
              <Loader />
            </View>
          ) : (
            <EmptyState
              icon="notifications-off-outline"
              title={error ? "Couldn't load notifications" : "No notifications yet"}
              message={
                error
                  ? error
                  : "You'll see incident alerts, incoming calls, and account updates here."
              }
              actionLabel={error ? "Try again" : undefined}
              onAction={error ? fetchInitial : undefined}
            />
          )
        }
        ListFooterComponent={
          loading && items.length > 0 ? (
            <View style={styles.loaderWrap}>
              <Loader />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function NotificationRow({ item, onPress }: { item: AppNotification; onPress: () => void }) {
  const icon = iconFor(item.type);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
      <View style={[styles.iconCircle, { backgroundColor: icon.bg }]}>
        <Ionicons name={icon.name} size={20} color={icon.tint} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <Text variant="bodyMedium" numberOfLines={1} style={styles.rowTitle}>
            {item.title}
          </Text>
          <Text variant="caption" muted>
            {formatRelative(item.createdAt)}
          </Text>
        </View>
        <Text variant="small" muted numberOfLines={2}>
          {item.body}
        </Text>
      </View>
      {!item.isRead ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  padded: { paddingHorizontal: spacing.xxl },
  listContent: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.huge, flexGrow: 1 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md, paddingVertical: spacing.sm },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  rowBody: { flex: 1, gap: 2 },
  rowHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm },
  rowTitle: { flex: 1 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    alignSelf: "center",
    marginLeft: spacing.sm
  },
  loaderWrap: { paddingVertical: spacing.xxl, alignItems: "center" }
});
