'use client';

import { useEffect } from 'react';

import Button from '../../../components/ui/Button';
import { useNotificationsStore } from '../../../stores/useNotificationsStore';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export default function NotificationsPage() {
    const fetch = useNotificationsStore((s) => s.fetch);
    const items = useNotificationsStore((s) => s.items);
    const loading = useNotificationsStore((s) => s.loading);
    const error = useNotificationsStore((s) => s.error);
    const markRead = useNotificationsStore((s) => s.markRead);
    const markAllRead = useNotificationsStore((s) => s.markAllRead);
    const push = useNotificationStore((s) => s.push);

    useEffect(() => {
        void fetch();
    }, [fetch]);

    return (
        <div className="mx-auto w-full max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                <Button
                    type="button"
                    className="w-auto whitespace-nowrap px-6 py-3 text-base"
                    disabled={loading || items.length === 0}
                    onClick={() =>
                        void markAllRead()
                            .then(() => push('success', 'All notifications marked as read.'))
                            .catch(() => {})
                    }
                >
                    Mark all as read
                </Button>
            </div>

            {loading ? <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading notifications...</p> : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && items.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-700">You have no notifications.</p>
                </div>
            ) : null}

            {items.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <ul className="divide-y divide-gray-100">
                        {items.map((n) => (
                            <li key={n.id} className="px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p
                                            className={`text-sm font-semibold ${n.readAt ? 'text-gray-800' : 'text-gray-900'}`}
                                        >
                                            {n.title}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-600">{n.body}</p>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {new Date(n.createdAt).toLocaleString('en-US')}
                                        </p>
                                    </div>
                                    {!n.readAt ? (
                                        <button
                                            type="button"
                                            className="shrink-0 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-100"
                                            onClick={() =>
                                                void markRead(n.id)
                                                    .then(() => push('success', 'Notification marked as read.'))
                                                    .catch(() => {})
                                            }
                                        >
                                            Mark as read
                                        </button>
                                    ) : null}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
        </div>
    );
}
