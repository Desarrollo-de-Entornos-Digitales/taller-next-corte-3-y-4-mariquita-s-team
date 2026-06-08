'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { useAuthSession } from '../hooks/useAuthSession';

type SidebarItem = { label: string; href: string; sellerOnly?: boolean };

const SIDEBAR_OPEN_KEY = 'vincobov.sidebarOpen';

const baseItems: SidebarItem[] = [
    { label: 'Home', href: '/' },
    { label: 'My posts', href: '/mis-posts', sellerOnly: true },
    { label: 'Sales history', href: '/historial-ventas', sellerOnly: true },
    { label: 'Messages', href: '/mensajes' },
    { label: 'Favorites', href: '/favoritos' },
];

const icons: Record<string, string> = {
    Home: '/icons/home.png',
    'My posts': '/icons/my%20posts.png',
    'Sales history': '/icons/dashboard.png',
    Messages: '/icons/messages.png',
    Favorites: '/icons/favorites.png',
};

export default function Sidebar({
    mobileOpen,
    onRequestCloseMobile,
}: {
    mobileOpen: boolean;
    onRequestCloseMobile: () => void;
}) {
    const session = useAuthSession();
    const [open, setOpen] = useState(() => {
        if (typeof window === 'undefined') {
            return true;
        }
        return window.localStorage.getItem(SIDEBAR_OPEN_KEY) !== '0';
    });

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        window.localStorage.setItem(SIDEBAR_OPEN_KEY, open ? '1' : '0');
    }, [open]);

    const items = useMemo(() => {
        if (!session.isSeller) {
            return baseItems.filter((item) => !item.sellerOnly);
        }
        return baseItems;
    }, [session.isSeller]);

    return (
        <aside
            className={`shrink-0 border-r border-gray-200 bg-white transition-[width] duration-200 ${
                mobileOpen
                    ? 'fixed inset-y-0 left-0 z-40 w-[220px] shadow-xl lg:static lg:shadow-none'
                    : 'hidden lg:block'
            } ${open ? 'lg:w-[220px]' : 'lg:w-[68px]'}`}
        >
            <div
                className={`flex items-center border-b border-gray-100 p-3 ${open ? 'justify-between' : 'justify-center'}`}
            >
                {open ? <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Menu</span> : null}
                <button
                    type="button"
                    onClick={() => setOpen((prev) => !prev)}
                    className="rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50"
                    aria-label={open ? 'Hide menu' : 'Show menu'}
                    aria-expanded={open}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className={`h-4 w-4 transition-transform ${open ? '' : 'rotate-180'}`}
                        aria-hidden
                    >
                        <path d="M15 18 9 12 15 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
            </div>
            <ul className="space-y-1 p-3">
                {items.map((item) => (
                    <li key={item.label}>
                        <Link
                            href={item.href}
                            title={item.label}
                            onClick={onRequestCloseMobile}
                            className={`flex items-center rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 ${
                                open || mobileOpen ? 'gap-2.5 px-3' : 'justify-center px-2'
                            }`}
                        >
                            {icons[item.label] ? (
                                <Image src={icons[item.label]} alt="" width={18} height={18} aria-hidden />
                            ) : null}
                            {open || mobileOpen ? <span>{item.label}</span> : null}
                        </Link>
                    </li>
                ))}
            </ul>
        </aside>
    );
}
