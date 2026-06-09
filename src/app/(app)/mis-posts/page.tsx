'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ProductCard from '../../../components/ui/ProductCard';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { fetchProducts } from '../../../lib/api';
import type { ApiProduct } from '../../../lib/types';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export default function MyPostsPage() {
    const session = useAuthSession();
    const push = useNotificationStore((s) => s.push);
    const [items, setItems] = useState<ApiProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session.ready) {
            return;
        }
        const userId = session.userId;
        if (!session.authenticated || !userId) return;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchProducts({ createdBy: userId, limit: 100, offset: 0 });
                setItems(data);
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Could not load your listings.';
                setError(message);
                push('error', message);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [session.ready, session.authenticated, session.userId, push]);

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900">My listings</h1>
                <Link
                    href="/productos/nuevo"
                    className="rounded-lg bg-[#2f7d4d] px-4 py-2 text-sm font-semibold text-white hover:bg-[#256b3f]"
                >
                    + Post new product
                </Link>
            </div>

            {loading ? <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading your listings...</p> : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && !error && items.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-700">You have not posted any products yet.</p>
                </div>
            ) : null}

            {items.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {items.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.title}
                            description={product.description}
                            category={product.category}
                            price={Number(product.price)}
                            imageUrl={product.imageUrl ?? undefined}
                            location={product.location ?? undefined}
                            sellerName={product.createdBy?.username}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    );
}
