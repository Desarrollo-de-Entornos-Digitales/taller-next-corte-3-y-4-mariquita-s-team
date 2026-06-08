import { create } from 'zustand';

import type { ApiNotification } from '../lib/types';
import { fetchNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/api';

type NotificationsState = {
    items: ApiNotification[];
    loading: boolean;
    error: string;
    fetch: () => Promise<void>;
    poll: () => Promise<ApiNotification[]>;
    unreadCount: () => number;
    markRead: (id: number) => Promise<void>;
    markAllRead: () => Promise<void>;
    clearLocal: () => void;
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
    items: [],
    loading: false,
    error: '',
    fetch: async () => {
        set({ loading: true, error: '' });
        try {
            const items = await fetchNotifications();
            set({ items });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not load notifications.';
            set({ error: message, items: [] });
        } finally {
            set({ loading: false });
        }
    },
    poll: async () => {
        try {
            const items = await fetchNotifications();
            const previousIds = new Set(get().items.map((item) => item.id));
            const incoming = items.filter((item) => !previousIds.has(item.id) && !item.readAt);
            set({ items, error: '' });
            return incoming;
        } catch {
            return [];
        }
    },
    unreadCount: () => get().items.filter((n) => !n.readAt).length,
    markRead: async (id) => {
        set({ loading: true, error: '' });
        try {
            const updated = await markNotificationRead(id);
            set((state) => ({ items: state.items.map((n) => (n.id === id ? updated : n)) }));
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not mark notification as read.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    markAllRead: async () => {
        set({ loading: true, error: '' });
        try {
            await markAllNotificationsRead();
            const items = await fetchNotifications();
            set({ items });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not mark all notifications as read.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    clearLocal: () => set({ items: [], error: '' }),
}));
