'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuthSession } from '../../../hooks/useAuthSession';
import { fetchSellerOrders } from '../../../lib/api';
import type { ApiOrder } from '../../../lib/types';
import { useNotificationStore } from '../../../stores/useNotificationStore';

function formatPrice(value: number | string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return '--';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
        parsed,
    );
}

function formatDate(value?: string) {
    if (!value) {
        return 'Date unavailable';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return 'Date unavailable';
    }
    return date.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function statusLabel(status: ApiOrder['status']) {
    if (status === 'paid') return 'Paid';
    if (status === 'cancelled') return 'Cancelled';
    return 'Pending';
}

function statusClass(status: ApiOrder['status']) {
    if (status === 'paid') return 'bg-green-50 text-green-800 ring-green-200';
    if (status === 'cancelled') return 'bg-rose-50 text-rose-700 ring-rose-200';
    return 'bg-amber-50 text-amber-800 ring-amber-200';
}

export default function SalesHistoryPage() {
    const router = useRouter();
    const session = useAuthSession();
    const push = useNotificationStore((s) => s.push);
    const [orders, setOrders] = useState<ApiOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session.ready) {
            return;
        }

        if (!session.authenticated) {
            router.replace('/login');
            return;
        }

        if (!session.isSeller) {
            router.replace('/');
            return;
        }

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchSellerOrders();
                if (!cancelled) {
                    setOrders(data);
                }
            } catch (e) {
                if (!cancelled) {
                    const message = e instanceof Error ? e.message : 'Could not load sales history.';
                    setError(message);
                    push('error', message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void load();

        return () => {
            cancelled = true;
        };
    }, [session.ready, session.authenticated, session.isSeller, session.userId, router, push]);

    const totalRevenue = useMemo(
        () => orders.filter((o) => o.status === 'paid').reduce((acc, o) => acc + Number(o.totalPrice), 0),
        [orders],
    );

    const totalUnits = useMemo(
        () => orders.filter((o) => o.status === 'paid').reduce((acc, o) => acc + o.quantity, 0),
        [orders],
    );

    if (!session.ready) {
        return <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading session...</p>;
    }

    if (!session.authenticated) {
        return <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Redirecting to login...</p>;
    }

    if (!session.isSeller) {
        return (
            <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-8 text-center shadow-sm">
                <p className="text-base font-semibold text-gray-900">Seller access only</p>
                <p className="mt-2 text-sm text-gray-600">
                    Sales history is only available for accounts with a seller role.
                </p>
                <Link
                    href="/"
                    className="mt-4 inline-flex rounded-lg bg-[#2f7d4d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256b3f]"
                >
                    Back to home
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales history</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Review purchases made on your published products.
                    </p>
                </div>
                <Link
                    href="/mis-posts"
                    className="rounded-lg border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                >
                    View my listings
                </Link>
            </div>

            <div className="mb-5 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recorded sales</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{loading ? '—' : orders.length}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Units sold</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{loading ? '—' : totalUnits}</p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Total revenue</p>
                    <p className="mt-2 text-2xl font-bold text-[#2f7d4d]">
                        {loading ? '—' : formatPrice(totalRevenue)}
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading sales history...</p>
            ) : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && !error && orders.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-base font-semibold text-gray-900">No sales recorded yet</p>
                    <p className="mt-2 text-sm text-gray-600">
                        When someone buys one of your products, the sale will appear here and you will receive a
                        notification.
                    </p>
                    <Link
                        href="/productos/nuevo"
                        className="mt-4 inline-flex rounded-lg bg-[#2f7d4d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256b3f]"
                    >
                        Post a product
                    </Link>
                </div>
            ) : null}

            {!loading && orders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <ul className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <li key={order.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                    {order.product?.imageUrl ? (
                                        <Image
                                            src={order.product.imageUrl}
                                            alt={order.product.title ?? 'Product'}
                                            fill
                                            sizes="64px"
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-gray-500">
                                            No image
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {order.product?.title ?? `Product #${order.product?.id ?? '—'}`}
                                        </p>
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass(order.status)}`}
                                        >
                                            {statusLabel(order.status)}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Buyer:{' '}
                                        <span className="font-medium text-gray-800">
                                            {order.buyer?.username ?? order.buyer?.email ?? 'User'}
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {order.quantity} unit(s) · {formatDate(order.createdAt)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-[#2f7d4d]">{formatPrice(order.totalPrice)}</p>
                                    {order.product?.id ? (
                                        <Link
                                            href={`/productos/${order.product.id}`}
                                            className="mt-1 inline-block text-xs font-semibold text-green-700 hover:text-green-800"
                                        >
                                            View product
                                        </Link>
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
