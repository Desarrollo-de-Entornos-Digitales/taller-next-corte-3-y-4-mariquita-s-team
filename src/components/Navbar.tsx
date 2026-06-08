'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { useSearchStore } from '../stores/useSearchStore';
import { useCartStore } from '../stores/useCartStore';
import { useNotificationsStore } from '../stores/useNotificationsStore';
import { useNotificationStore } from '../stores/useNotificationStore';

type NavbarProps = {
    mode?: 'guest' | 'authenticated';
    userName?: string;
    userAvatar?: string | null;
    onLogout?: () => void;
};

function SearchIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20 16.5 16.5" />
        </svg>
    );
}

function BellIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
        </svg>
    );
}

function CartIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.6 13.4a2 2 0 002 1.6h9.8a2 2 0 002-1.6L23 6H6" />
        </svg>
    );
}

function SearchField({
    query,
    onChange,
    onSubmit,
    testId,
}: {
    query: string;
    onChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    testId: string;
}) {
    return (
        <form className="flex w-full items-stretch" onSubmit={onSubmit}>
            <input
                type="search"
                placeholder="Search products..."
                value={query}
                onChange={(event) => onChange(event.target.value)}
                className="min-w-0 flex-1 rounded-l-lg border border-[#a7b3a9] border-r-0 px-4 py-2.5 text-sm outline-none focus:border-green-700"
                data-testid={testId}
                aria-label="Search products"
            />
            <button
                type="submit"
                className="flex shrink-0 items-center justify-center rounded-r-lg border border-[#a7b3a9] bg-[#2f7d4d] px-3.5 text-white transition-colors hover:bg-[#256b3f]"
                aria-label="Search"
            >
                <SearchIcon className="h-5 w-5" />
            </button>
        </form>
    );
}

export default function Navbar({ mode = 'guest', userName = 'User', userAvatar = null, onLogout }: NavbarProps) {
    const router = useRouter();
    const query = useSearchStore((state) => state.query);
    const setQuery = useSearchStore((state) => state.setQuery);
    const cart = useCartStore((state) => state.cart);
    const hydrateCart = useCartStore((state) => state.hydrate);
    const clearCartLocal = useCartStore((state) => state.clearLocal);
    const notifications = useNotificationsStore((state) => state.items);
    const fetchNotifications = useNotificationsStore((state) => state.fetch);
    const pollNotifications = useNotificationsStore((state) => state.poll);
    const markAllRead = useNotificationsStore((state) => state.markAllRead);
    const clearNotificationsLocal = useNotificationsStore((state) => state.clearLocal);
    const pushToast = useNotificationStore((state) => state.push);
    const notificationsReadyRef = useRef(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);

    const cartCount = useMemo(
        () => (cart?.items ?? []).reduce((acc, item) => acc + (item.quantity ?? 0), 0),
        [cart?.items],
    );
    const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

    useEffect(() => {
        if (mode !== 'authenticated') {
            clearCartLocal();
            clearNotificationsLocal();
            return;
        }
        notificationsReadyRef.current = false;
        void hydrateCart();
        void fetchNotifications().finally(() => {
            notificationsReadyRef.current = true;
        });
    }, [mode, hydrateCart, fetchNotifications, clearCartLocal, clearNotificationsLocal]);

    useEffect(() => {
        if (mode !== 'authenticated') {
            return;
        }

        const intervalId = window.setInterval(() => {
            if (!notificationsReadyRef.current) {
                return;
            }
            void pollNotifications().then((incoming) => {
                for (const notification of incoming) {
                    const toastType = notification.type === 'purchase' ? 'success' : 'info';
                    pushToast(toastType, `${notification.title}: ${notification.body}`);
                }
            });
        }, 10_000);

        return () => window.clearInterval(intervalId);
    }, [mode, pollNotifications, pushToast]);

    const handleSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="search"]');
        const nextQuery = (input?.value ?? query).trim();
        setQuery(nextQuery);

        const params = new URLSearchParams();
        if (nextQuery) {
            params.set('q', nextQuery);
        }
        router.push(params.toString() ? `/?${params.toString()}` : '/');
    };

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex w-full max-w-[1600px] flex-wrap items-center gap-3 px-4 py-4 md:flex-nowrap md:gap-6 md:px-6">
                <Link href="/" className="flex shrink-0 items-center gap-2">
                    <Image src="/LogoVin.png" alt="Logo VincoBov" width={30} height={30} priority />
                    <span className="text-2xl font-semibold text-[#1f4f32] md:text-3xl">VincoBov</span>
                </Link>

                <div className="order-3 hidden w-full min-w-0 md:order-none md:flex md:flex-1 md:justify-center">
                    <div className="w-full max-w-xl">
                        <SearchField
                            query={query}
                            onChange={setQuery}
                            onSubmit={handleSearch}
                            testId="navbar-search-input"
                        />
                    </div>
                </div>

                {/* Right cluster: nav + auth so lg breakpoint does not wrap a 4th grid cell onto a new row. */}
                <div className="ml-auto flex shrink-0 items-center gap-3 text-sm sm:gap-4 md:ml-0 lg:gap-6">
                    <nav className="hidden items-center gap-4 font-medium text-gray-600 lg:flex">
                        <Link href="/" className="whitespace-nowrap hover:text-[#2f7d4d]">
                            Home
                        </Link>
                        <Link
                            href="/productos/nuevo"
                            className="whitespace-nowrap hover:text-[#2f7d4d]"
                            data-testid="post-product-link"
                        >
                            Post
                        </Link>
                        {mode === 'authenticated' && (
                            <Link href="/perfil" className="whitespace-nowrap hover:text-[#2f7d4d]">
                                Profile
                            </Link>
                        )}
                    </nav>

                    {mode === 'authenticated' ? (
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/carrito"
                                    className="relative rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                                    aria-label="Open cart"
                                    data-testid="navbar-cart-link"
                                >
                                    <CartIcon className="h-5 w-5" />
                                    {cartCount > 0 ? (
                                        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold leading-none text-white">
                                            {cartCount > 99 ? '99+' : cartCount}
                                        </span>
                                    ) : null}
                                </Link>

                                <div className="relative">
                                    <button
                                        type="button"
                                        className="relative rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
                                        aria-label="Notifications"
                                        aria-expanded={notificationsOpen}
                                        onClick={() => setNotificationsOpen((o) => !o)}
                                        data-testid="navbar-notifications-button"
                                    >
                                        <BellIcon className="h-5 w-5" />
                                        {unreadCount > 0 ? (
                                            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold leading-none text-white">
                                                {unreadCount > 99 ? '99+' : unreadCount}
                                            </span>
                                        ) : null}
                                    </button>

                                    {notificationsOpen ? (
                                        <div className="absolute right-0 z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                                                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                                                <button
                                                    type="button"
                                                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 hover:bg-green-100"
                                                    onClick={() =>
                                                        void markAllRead().finally(() => setNotificationsOpen(false))
                                                    }
                                                >
                                                    Mark all as read
                                                </button>
                                            </div>
                                            <div className="max-h-[340px] overflow-auto">
                                                {notifications.slice(0, 5).length === 0 ? (
                                                    <p className="px-4 py-4 text-sm text-gray-600">
                                                        You have no notifications.
                                                    </p>
                                                ) : (
                                                    <ul className="divide-y divide-gray-100">
                                                        {notifications.slice(0, 5).map((n) => (
                                                            <li key={n.id} className="px-4 py-3">
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {n.title}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-600">{n.body}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                            <div className="border-t border-gray-100 px-4 py-3">
                                                <Link
                                                    href="/notificaciones"
                                                    className="text-sm font-semibold text-green-700 hover:text-green-800"
                                                    onClick={() => setNotificationsOpen(false)}
                                                >
                                                    View all
                                                </Link>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <Link
                                href="/perfil"
                                className="flex max-w-[11rem] items-center gap-2 rounded-lg border border-gray-200 px-2 py-1.5 hover:bg-gray-50 sm:max-w-none sm:px-3"
                                data-testid="navbar-profile-link"
                            >
                                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-100 text-sm font-semibold text-green-700">
                                    {userAvatar ? (
                                        <Image
                                            src={userAvatar}
                                            alt={userName}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <span className="hidden min-w-0 truncate font-medium text-gray-700 sm:inline">
                                    {userName}
                                </span>
                            </Link>
                            <button
                                type="button"
                                className="shrink-0 rounded border border-gray-300 px-3 py-1.5 text-gray-600 hover:bg-gray-50 sm:px-4"
                                onClick={onLogout}
                                data-testid="navbar-logout-button"
                            >
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="whitespace-nowrap rounded border border-gray-300 px-3 py-1.5 text-gray-600 sm:px-4"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/registro"
                                className="whitespace-nowrap rounded bg-[#2f7d4d] px-3 py-1.5 text-white sm:px-4"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-gray-100 px-4 py-2 md:hidden">
                <SearchField
                    query={query}
                    onChange={setQuery}
                    onSubmit={handleSearch}
                    testId="navbar-search-input-mobile"
                />
            </div>
        </header>
    );
}
