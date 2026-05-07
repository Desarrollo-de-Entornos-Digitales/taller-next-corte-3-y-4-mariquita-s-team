'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import PanelCard from '../components/ui/PanelCard';
import ProductCard from '../components/ui/ProductCard';
import {
    clearAccessToken,
    clearAuthUserEmail,
    formatDisplayName,
    getAuthHeaders,
    getAccessToken,
    getAuthUserEmail,
} from '../lib/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

type ApiProduct = {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number | string;
    imageUrl?: string | null;
    location?: string | null;
    createdBy?: {
        username?: string;
    };
};

const categories = [
    { label: 'All', value: 'all' },
    { label: 'Livestock', value: 'livestock' },
    { label: 'Agriculture', value: 'crop' },
    { label: 'Refined', value: 'refined' },
];

const feedTabs = ['All', 'Livestock', 'Agriculture', 'Poultry farming', 'Supplies and equipment', 'Other products'];
const quickPostOptions = ['Livestock', 'Agriculture', 'Poultry farming', 'Supplies and equipment', 'Other products'];
const leftMenu = ['Home', 'Posts', 'My posts', 'Messages', 'Favorites', 'Notifications', 'Dash board'];
const leftMenuIcons: Record<string, string> = {
    Home: '/icons/home.png',
    Posts: '/icons/posts.png',
    'My posts': '/icons/my%20posts.png',
    Messages: '/icons/messages.png',
    Favorites: '/icons/favorites.png',
    Notifications: '/icons/notifications.png',
    'Dash board': '/icons/dashboard.png',
};
const optionIcons: Record<string, string> = {
    Livestock: '/icons/Livestock.png',
    Agriculture: '/icons/Agriculture.png',
    'Poultry farming': '/icons/Poultry%20farming.png',
    'Supplies and equipment': '/icons/Supplies%20and%20equipment.png',
    'Other products': '/icons/Other%20products.png',
};
const tabToCategory: Record<string, string> = {
    All: 'all',
    Livestock: 'livestock',
    Agriculture: 'crop',
};
const PAGE_SIZE = 8;

export default function Home() {
    const router = useRouter();
    const [products, setProducts] = useState<ApiProduct[]>([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeMenuItem, setActiveMenuItem] = useState('Posts');
    const [activeFeedTab, setActiveFeedTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const isAuthenticated = typeof window !== 'undefined' && Boolean(getAccessToken());
    const currentUserName =
        typeof window === 'undefined' || !isAuthenticated ? 'Usuario' : formatDisplayName(getAuthUserEmail());

    const logInteraction = (element: string, payload?: Record<string, unknown>) => {
        console.info(`[UI_INTERACTION] ${element}`, payload ?? {});
    };

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const params = new URLSearchParams();
                if (activeCategory !== 'all') {
                    params.set('category', activeCategory);
                }
                params.set('limit', String(PAGE_SIZE));
                params.set('offset', String((page - 1) * PAGE_SIZE));

                const response = await fetch(`${API_BASE_URL}/product?${params.toString()}`, {
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        clearAccessToken();
                        clearAuthUserEmail();
                        setError('Sesion expirada. Puedes seguir navegando o iniciar sesion nuevamente.');
                        setProducts([]);
                        return;
                    }
                    throw new Error('No fue posible cargar productos desde backend.');
                }

                const body = (await response.json()) as ApiProduct[];
                setProducts(body);
                setHasMore(body.length === PAGE_SIZE);
            } catch (fetchError) {
                const message = fetchError instanceof Error ? fetchError.message : 'Error cargando productos.';
                setError(message);
                setProducts([]);
                setHasMore(false);
            } finally {
                setLoading(false);
            }
        };

        void fetchProducts();
    }, [activeCategory, page]);

    return (
        <div className="min-h-screen bg-[#f3f3f3] text-gray-900">
            <Navbar
                mode={isAuthenticated ? 'authenticated' : 'guest'}
                userName={currentUserName}
                onMenuClick={() => logInteraction('navbar_menu_click')}
                onCartClick={() => logInteraction('navbar_cart_click')}
                onLogout={
                    isAuthenticated
                        ? () => {
                              clearAccessToken();
                              clearAuthUserEmail();
                              logInteraction('navbar_logout_click');
                              router.push('/');
                          }
                        : undefined
                }
            />

            <main className="mx-auto grid w-full max-w-[1600px] grid-cols-1 lg:grid-cols-[250px_1fr_270px]">
                <aside className="border-r border-gray-200 bg-white p-5">
                    <ul className="space-y-2">
                        {leftMenu.map((item) => (
                            <li
                                key={item}
                                className={`rounded px-3 py-2 text-sm font-medium ${
                                    item === activeMenuItem ? 'bg-[#2f7d4d] text-white' : 'text-gray-700'
                                }`}
                            >
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 text-left"
                                    onClick={() => {
                                        setActiveMenuItem(item);
                                        logInteraction('left_menu_click', { item });
                                    }}
                                >
                                    {leftMenuIcons[item] ? (
                                        <Image src={leftMenuIcons[item]} alt={item} width={16} height={16} />
                                    ) : null}
                                    {item}
                                </button>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 border-t border-gray-200 pt-5">
                        <h2 className="text-sm font-bold uppercase text-gray-700">Categories</h2>
                        <div className="mt-3 space-y-1.5">
                            {categories.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={`w-full rounded px-3 py-2 text-left text-sm ${
                                        activeCategory === item.value
                                            ? 'bg-green-100 font-semibold text-green-800'
                                            : 'text-gray-700 hover:bg-gray-100'
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
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-5">
                        <h2 className="text-sm font-bold uppercase text-gray-700">Help & Support</h2>
                        <p className="mt-3 text-sm text-gray-700">Help and support</p>
                    </div>
                </aside>

                <section className="p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <h1 className="text-5xl font-bold">Featured Post</h1>
                        <button
                            type="button"
                            className="text-sm font-semibold text-[#2f7d4d]"
                            onClick={() => logInteraction('featured_see_all_click')}
                        >
                            See all
                        </button>
                    </div>

                    <div className="mb-5 flex flex-wrap gap-2">
                        {feedTabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                    tab === activeFeedTab
                                        ? 'border-[#2f7d4d] bg-[#2f7d4d] text-white'
                                        : 'border-gray-300 bg-white text-gray-600'
                                }`}
                                onClick={() => {
                                    setActiveFeedTab(tab);
                                    const mappedCategory = tabToCategory[tab];
                                    if (mappedCategory) {
                                        setActiveCategory(mappedCategory);
                                        setPage(1);
                                    }
                                    logInteraction('feed_tab_click', { tab, mappedCategory: mappedCategory ?? null });
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {loading && <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Cargando productos...</p>}
                    {error && <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}

                    {!loading && !error && products.length === 0 && (
                        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                            No hay productos para esta categoria en este momento.
                        </p>
                    )}

                    {!loading && products.length > 0 && (
                        <div className="space-y-4">
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {products.map((product) => (
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
                                        onClick={(id) => logInteraction('product_card_click', { productId: id })}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center justify-between rounded-lg bg-white p-3">
                                <button
                                    type="button"
                                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                    disabled={page === 1 || loading}
                                >
                                    Anterior
                                </button>
                                <p className="text-sm text-gray-600">Pagina {page}</p>
                                <button
                                    type="button"
                                    className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => setPage((prev) => prev + 1)}
                                    disabled={!hasMore || loading}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                <aside className="space-y-4 border-l border-gray-200 p-5">
                    <button
                        type="button"
                        className="w-full rounded-lg bg-[#2f7d4d] px-4 py-3 text-sm font-semibold text-white"
                        onClick={() => logInteraction('post_product_click')}
                    >
                        + Post product
                    </button>

                    <PanelCard title="What you want to post?">
                        <ul className="space-y-3 text-sm text-gray-700">
                            {quickPostOptions.map((option) => (
                                <li key={option}>
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 text-left hover:text-[#2f7d4d]"
                                        onClick={() => logInteraction('quick_post_option_click', { option })}
                                    >
                                        {optionIcons[option] ? (
                                            <Image src={optionIcons[option]} alt={option} width={14} height={14} />
                                        ) : null}
                                        {option}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </PanelCard>

                    <PanelCard title="Sell faster">
                        <p className="text-sm text-gray-600">Highlight your publication and reach more buyers.</p>
                        <button
                            type="button"
                            className="mt-4 w-full rounded-lg bg-[#2f7d4d] px-3 py-2 text-sm font-semibold text-white"
                            onClick={() => logInteraction('highlight_ad_click')}
                        >
                            Highlight Ad
                        </button>
                    </PanelCard>

                    <PanelCard title="Advices VincoBov">
                        <p className="text-sm text-gray-600">
                            Post clear photos, detailed descriptions, and fair prices to sell faster.
                        </p>
                        <button
                            type="button"
                            className="mt-3 text-sm font-semibold text-[#2f7d4d]"
                            onClick={() => logInteraction('see_more_advices_click')}
                        >
                            See more advices
                        </button>
                    </PanelCard>
                </aside>
            </main>

            <Footer />
        </div>
    );
}
