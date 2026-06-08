'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';

import ProductCard from '../../components/ui/ProductCard';
import { PRODUCT_CATEGORIES } from '../../lib/categories';
import { fetchProducts, filterProductsBySearch } from '../../lib/api';
import type { ApiProduct } from '../../lib/types';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useSearchStore } from '../../stores/useSearchStore';

const PAGE_SIZE = 8;

function HomeContent() {
    const searchParams = useSearchParams();
    const pushNotification = useNotificationStore((state) => state.push);
    const searchQuery = useSearchStore((state) => state.query);
    const setSearchQuery = useSearchStore((state) => state.setQuery);

    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const urlQuery = searchParams.get('q') ?? '';

    // Sync store from URL only when the URL query changes (not on every keystroke in the navbar).
    useEffect(() => {
        setSearchQuery(urlQuery);
    }, [urlQuery, setSearchQuery]);

    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const isSearching = Boolean(searchQuery.trim());
                const data = await fetchProducts({
                    category: activeCategory,
                    limit: isSearching ? 100 : PAGE_SIZE,
                    offset: isSearching ? 0 : (page - 1) * PAGE_SIZE,
                });

                const filtered = filterProductsBySearch(data, searchQuery);
                setProducts(filtered);
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Error loading products.';
                setError(message);
                setProducts([]);
                pushNotification('error', message);
            } finally {
                setLoading(false);
            }
        };

        void loadProducts();
    }, [activeCategory, page, searchQuery, pushNotification]);

    const paginatedProducts = useMemo(() => {
        if (searchQuery.trim()) {
            const start = (page - 1) * PAGE_SIZE;
            return products.slice(start, start + PAGE_SIZE);
        }
        return products;
    }, [products, page, searchQuery]);

    const hasMore = useMemo(() => {
        if (searchQuery.trim()) {
            return page * PAGE_SIZE < products.length;
        }
        return products.length === PAGE_SIZE;
    }, [products.length, page, searchQuery]);

    return (
        <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-4xl font-bold md:text-5xl">Featured Post</h1>
                {searchQuery && (
                    <p className="text-sm text-gray-600">
                        Results for: <span className="font-semibold">{searchQuery}</span>
                    </p>
                )}
            </div>

            <div className="mb-5 flex flex-wrap gap-2" data-testid="category-filters">
                {PRODUCT_CATEGORIES.map((item) => (
                    <button
                        key={item.value}
                        type="button"
                        className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            activeCategory === item.value
                                ? 'border-[#2f7d4d] bg-[#2f7d4d] text-white'
                                : 'border-gray-300 bg-white text-gray-600 hover:border-[#2f7d4d]/40'
                        }`}
                        onClick={() => {
                            setActiveCategory(item.value);
                            setPage(1);
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {loading && <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading products...</p>}
            {error && (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            )}

            {!loading && !error && paginatedProducts.length === 0 && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                    No products found for this search or category.
                </p>
            )}

            {!loading && paginatedProducts.length > 0 && (
                <div className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4" data-testid="product-grid">
                        {paginatedProducts.map((product) => (
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
                    <div className="flex items-center justify-between rounded-lg bg-white p-3">
                        <button
                            type="button"
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page === 1 || loading}
                            data-testid="pagination-prev"
                        >
                            Previous
                        </button>
                        <p className="text-sm text-gray-600">Page {page}</p>
                        <button
                            type="button"
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!hasMore || loading}
                            data-testid="pagination-next"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

export default function Home() {
    return (
        <Suspense fallback={<p className="p-8 text-sm text-gray-600">Loading feed...</p>}>
            <HomeContent />
        </Suspense>
    );
}

