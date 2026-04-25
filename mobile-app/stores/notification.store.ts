import { create } from "zustand";
import type { AppNotification } from "@/types/notification";

type NotificationState = {
  items: AppNotification[];
  unreadCount: number;
  nextCursor: string | null;
  hasMore: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  setItems: (items: AppNotification[], unreadCount: number, nextCursor: string | null) => void;
  appendItems: (items: AppNotification[], nextCursor: string | null) => void;
  prependIncoming: (item: AppNotification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  setUnreadCount: (count: number) => void;
  setLoading: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  nextCursor: null,
  hasMore: false,
  loading: false,
  refreshing: false,
  error: null,
  setItems: (items, unreadCount, nextCursor) =>
    set({ items, unreadCount, nextCursor, hasMore: !!nextCursor, error: null }),
  appendItems: (items, nextCursor) =>
    set((s) => ({
      items: [...s.items, ...items.filter((n) => !s.items.some((existing) => existing.id === n.id))],
      nextCursor,
      hasMore: !!nextCursor
    })),
  prependIncoming: (item) =>
    set((s) => {
      if (s.items.some((n) => n.id === item.id)) return s;
      return {
        items: [item, ...s.items],
        unreadCount: item.isRead ? s.unreadCount : s.unreadCount + 1
      };
    }),
  markRead: (id) =>
    set((s) => {
      let changed = false;
      const next = s.items.map((n) => {
        if (n.id !== id || n.isRead) return n;
        changed = true;
        return { ...n, isRead: true, readAt: new Date().toISOString() };
      });
      return {
        items: next,
        unreadCount: changed ? Math.max(0, s.unreadCount - 1) : s.unreadCount
      };
    }),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() })),
      unreadCount: 0
    })),
  setUnreadCount: (count) => set({ unreadCount: Math.max(0, count) }),
  setLoading: (loading) => set({ loading }),
  setRefreshing: (refreshing) => set({ refreshing }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      items: [],
      unreadCount: 0,
      nextCursor: null,
      hasMore: false,
      loading: false,
      refreshing: false,
      error: null
    })
}));
