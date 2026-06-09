'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import AlertBanner from '../../../../../components/ui/AlertBanner';
import { useAuthSession } from '../../../../../hooks/useAuthSession';
import { advanceOrderShipping, fetchOrderById } from '../../../../../lib/api';
import { SHIPPING_STAGES, getShippingStageIndex } from '../../../../../lib/shipping-stages';
import type { ApiOrder } from '../../../../../lib/types';
import { useNotificationStore } from '../../../../../stores/useNotificationStore';
import { useNotificationsStore } from '../../../../../stores/useNotificationsStore';

const TRACKING_INTERVAL_MS = 10_000;

function formatPrice(value: number | string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return '--';
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(parsed);
}

export default function OrderTrackingClient() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const orderId = Number(params.id);
    const session = useAuthSession();
    const pushToast = useNotificationStore((state) => state.push);
    const pollNotifications = useNotificationsStore((state) => state.poll);

    const [order, setOrder] = useState<ApiOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [completed, setCompleted] = useState(false);
    const [lastUpdateAt, setLastUpdateAt] = useState<string>('');

    const currentIndex = useMemo(
        () => getShippingStageIndex(order?.shippingStatus ?? null),
        [order?.shippingStatus],
    );

    const loadOrder = useCallback(async () => {
        if (!Number.isFinite(orderId)) {
            setError('Invalid order id.');
            setLoading(false);
            return;
        }

        try {
            const data = await fetchOrderById(orderId);
            setOrder(data);
            setCompleted(data.shippingStatus === 'delivered');
            setError('');
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Could not load order tracking.');
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const advanceShipping = useCallback(async () => {
        if (!Number.isFinite(orderId) || completed) {
            return;
        }

        try {
            const result = await advanceOrderShipping(orderId);
            setOrder(result.order);
            setCompleted(result.completed);
            setLastUpdateAt(new Date().toLocaleTimeString());
            if (result.notification) {
                pushToast('success', result.notification.body);
            }
            await pollNotifications();
        } catch (advanceError) {
            const message =
                advanceError instanceof Error ? advanceError.message : 'Could not refresh shipping status.';
            setError(message);
        }
    }, [orderId, completed, pollNotifications, pushToast]);

    useEffect(() => {
        if (!session.ready) {
            return;
        }

        if (!session.authenticated) {
            router.replace('/login');
            return;
        }

        void loadOrder();
    }, [session.ready, session.authenticated, router, loadOrder]);

    useEffect(() => {
        if (!order || completed || loading) {
            return;
        }

        const intervalId = window.setInterval(() => {
            void advanceShipping();
        }, TRACKING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [order, completed, loading, advanceShipping]);

    if (!session.ready || loading) {
        return <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading order tracking...</p>;
    }

    if (error && !order) {
        return (
            <div className="mx-auto max-w-3xl">
                <AlertBanner variant="error" message={error} />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className="mx-auto w-full max-w-4xl" data-testid="order-tracking">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
                <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-wide text-[#2f7d4d]">
                            Order tracking
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-gray-900">Shipment status</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Order #{order.id} · {order.product?.title ?? 'Product'}
                        </p>
                    </div>
                    <Link
                        href="/notificaciones"
                        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        View notifications
                    </Link>
                </div>

                {completed ? (
                    <div className="mb-6">
                        <AlertBanner
                            variant="success"
                            message="Your order was delivered successfully. Thanks for shopping on VincoBov."
                        />
                    </div>
                ) : (
                    <div className="mb-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Live updates every 10 seconds. You will receive a notification on each status change.
                        {lastUpdateAt ? <span className="block text-xs text-amber-700">Last update: {lastUpdateAt}</span> : null}
                    </div>
                )}

                <div className="mb-6 grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-3">
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Quantity</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">{order.quantity}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Total paid</p>
                        <p className="mt-1 text-lg font-bold text-[#2f7d4d]">{formatPrice(order.totalPrice)}</p>
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase text-gray-500">Current status</p>
                        <p className="mt-1 text-lg font-bold text-gray-900">
                            {SHIPPING_STAGES[currentIndex]?.timelineLabel ?? 'Pending'}
                        </p>
                    </div>
                </div>

                <ol className="space-y-4" data-testid="shipping-timeline">
                    {SHIPPING_STAGES.map((stage, index) => {
                        const reached = currentIndex >= index;
                        const active = currentIndex === index;
                        return (
                            <li
                                key={stage.status}
                                className={`flex gap-4 rounded-xl border p-4 ${
                                    active
                                        ? 'border-green-300 bg-green-50'
                                        : reached
                                          ? 'border-green-100 bg-white'
                                          : 'border-gray-200 bg-gray-50 opacity-70'
                                }`}
                                data-testid={`shipping-stage-${stage.status}`}
                            >
                                <span
                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                                        reached ? 'bg-green-700 text-white' : 'bg-gray-200 text-gray-500'
                                    }`}
                                >
                                    {reached ? '✓' : index + 1}
                                </span>
                                <div>
                                    <p className="font-semibold text-gray-900">{stage.timelineLabel}</p>
                                    <p className="mt-1 text-sm text-gray-600">{stage.body}</p>
                                </div>
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                        href="/"
                        className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800"
                    >
                        Back to feed
                    </Link>
                    <Link
                        href="/notificaciones"
                        className="rounded-md border border-green-700 px-4 py-2 text-sm font-semibold text-green-700"
                    >
                        Open notifications
                    </Link>
                </div>
            </div>
        </div>
    );
}
