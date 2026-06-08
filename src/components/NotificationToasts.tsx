'use client';

import { useNotificationStore } from '../stores/useNotificationStore';

const typeClasses = {
    success: 'border-green-300 bg-green-50 text-green-800',
    error: 'border-rose-300 bg-rose-50 text-rose-700',
    info: 'border-sky-300 bg-sky-50 text-sky-800',
};

export default function NotificationToasts() {
    const items = useNotificationStore((state) => state.items);
    const dismiss = useNotificationStore((state) => state.dismiss);

    if (items.length === 0) {
        return null;
    }

    return (
        <div className="pointer-events-none fixed right-4 top-20 z-50 flex w-full max-w-sm flex-col gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    role="status"
                    data-testid="notification-toast"
                    className={`pointer-events-auto rounded-lg border px-4 py-3 text-sm shadow-md ${typeClasses[item.type]}`}
                >
                    <div className="flex items-start justify-between gap-3">
                        <p>{item.message}</p>
                        <button
                            type="button"
                            className="text-xs font-semibold uppercase opacity-70"
                            onClick={() => dismiss(item.id)}
                            aria-label="Close notification"
                        >
                            x
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
