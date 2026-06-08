'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import ProductCard from '../../../components/ui/ProductCard';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { fetchFavorites, removeFavorite } from '../../../lib/api';
import type { ApiFavorite } from '../../../lib/types';
import { useNotificationStore } from '../../../stores/useNotificationStore';

export default function FavoritesPage() {
    const router = useRouter();
    const session = useAuthSession();
    const push = useNotificationStore((s) => s.push);
    const [favorites, setFavorites] = useState<ApiFavorite[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!session.ready) return;
        if (!session.authenticated) {
            router.replace('/login');
            return;
        }

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const data = await fetchFavorites();
                setFavorites(data);
            } catch (e) {
                const message = e instanceof Error ? e.message : 'Could not load favorites.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [session.ready, session.authenticated, router]);

    const handleRemove = async (productId: number) => {
        try {
            await removeFavorite(productId);
            setFavorites((prev) => prev.filter((item) => item.product.id !== productId));
            push('info', 'Removed from favorites.');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not remove favorite.';
            push('error', message);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Favorites</h1>
                    <p className="mt-1 text-sm text-gray-600">Products you saved for later.</p>
                </div>
                <Link href="/" className="text-sm font-semibold text-green-700 hover:text-green-800">
                    Browse feed
                </Link>
            </div>

            {loading ? <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading favorites...</p> : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && !error && favorites.length === 0 ? (
                <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-sm text-gray-700">You have not saved any products yet.</p>
                    <Link href="/" className="mt-4 inline-flex text-sm font-semibold text-green-700">
                        Explore products
                    </Link>
                </div>
            ) : null}

            {!loading && favorites.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {favorites.map((favorite) => (
                        <div key={favorite.id} className="relative">
                            <ProductCard
                                id={favorite.product.id}
                                title={favorite.product.title}
                                description={favorite.product.description}
                                category={favorite.product.category}
                                price={Number(favorite.product.price)}
                                imageUrl={favorite.product.imageUrl ?? undefined}
                                location={favorite.product.location ?? undefined}
                                sellerName={favorite.product.createdBy?.username}
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-rose-600 shadow"
                                onClick={() => void handleRemove(favorite.product.id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
