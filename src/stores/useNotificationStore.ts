import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info';

export type AppNotification = {
    id: string;
    type: NotificationType;
    message: string;
};

type NotificationState = {
    items: AppNotification[];
    push: (type: NotificationType, message: string) => void;
    dismiss: (id: string) => void;
    clear: () => void;
};

let counter = 0;

export const useNotificationStore = create<NotificationState>((set) => ({
    items: [],
    push: (type, message) => {
        const id = `notification-${Date.now()}-${counter++}`;
        set((state) => ({
            items: [...state.items, { id, type, message }],
        }));

        window.setTimeout(() => {
            set((state) => ({
                items: state.items.filter((item) => item.id !== id),
            }));
        }, 5000);
    },
    dismiss: (id) =>
        set((state) => ({
            items: state.items.filter((item) => item.id !== id),
        })),
    clear: () => set({ items: [] }),
}));
