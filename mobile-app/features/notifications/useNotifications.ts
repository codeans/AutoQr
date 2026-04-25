import { useCallback, useEffect } from "react";
import { useNotificationStore } from "@/stores/notification.store";
import { notificationsService } from "@/services/api/notifications.service";
import { setBadgeCount } from "@/services/notifications/notifications";
import { useAuthStore } from "@/stores/auth.store";

export function useNotifications() {
  const status = useAuthStore((s) => s.status);
  const items = useNotificationStore((s) => s.items);
  const hasMore = useNotificationStore((s) => s.hasMore);
  const loading = useNotificationStore((s) => s.loading);
  const refreshing = useNotificationStore((s) => s.refreshing);
  const error = useNotificationStore((s) => s.error);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const setItems = useNotificationStore((s) => s.setItems);
  const appendItems = useNotificationStore((s) => s.appendItems);
  const setLoading = useNotificationStore((s) => s.setLoading);
  const setRefreshing = useNotificationStore((s) => s.setRefreshing);
  const setError = useNotificationStore((s) => s.setError);
  const markReadLocal = useNotificationStore((s) => s.markRead);
  const markAllReadLocal = useNotificationStore((s) => s.markAllRead);
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);

  const fetchInitial = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    setError(null);
    try {
      const data = await notificationsService.list({ limit: 30 });
      setItems(data.notifications, data.unreadCount, data.nextCursor);
      setBadgeCount(data.unreadCount).catch(() => undefined);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [status, setError, setItems, setLoading]);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") return;
    setRefreshing(true);
    setError(null);
    try {
      const data = await notificationsService.list({ limit: 30 });
      setItems(data.notifications, data.unreadCount, data.nextCursor);
      setBadgeCount(data.unreadCount).catch(() => undefined);
    } catch (err: any) {
      setError(err?.message ?? "Failed to refresh notifications");
    } finally {
      setRefreshing(false);
    }
  }, [status, setError, setItems, setRefreshing]);

  const loadMore = useCallback(async () => {
    const state = useNotificationStore.getState();
    if (!state.hasMore || state.loading || !state.nextCursor) return;
    setLoading(true);
    try {
      const data = await notificationsService.list({ cursor: state.nextCursor, limit: 30 });
      appendItems(data.notifications, data.nextCursor);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [appendItems, setError, setLoading]);

  const markOneRead = useCallback(
    async (id: string) => {
      markReadLocal(id);
      const unread = useNotificationStore.getState().unreadCount;
      setBadgeCount(unread).catch(() => undefined);
      try {
        await notificationsService.markRead(id);
      } catch {
        // Silent — UI already reflects it; server will reconcile next fetch
      }
    },
    [markReadLocal]
  );

  const markAllRead = useCallback(async () => {
    markAllReadLocal();
    setBadgeCount(0).catch(() => undefined);
    try {
      await notificationsService.markAllRead();
    } catch {
      // Non-fatal
    }
  }, [markAllReadLocal]);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const { count } = await notificationsService.unreadCount();
      setUnreadCount(count);
      setBadgeCount(count).catch(() => undefined);
    } catch {
      // ignore
    }
  }, [setUnreadCount]);

  useEffect(() => {
    if (status === "authenticated") {
      refreshUnreadCount();
    }
  }, [status, refreshUnreadCount]);

  return {
    items,
    hasMore,
    loading,
    refreshing,
    error,
    unreadCount,
    fetchInitial,
    refresh,
    loadMore,
    markOneRead,
    markAllRead,
    refreshUnreadCount
  };
}
