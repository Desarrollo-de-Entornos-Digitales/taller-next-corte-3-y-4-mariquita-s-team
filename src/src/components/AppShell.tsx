'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';

import Footer from './Footer';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuthSession } from '../hooks/useAuthSession';
import { clearAuthSession } from '../lib/auth';
import { useNotificationStore } from '../stores/useNotificationStore';

export default function AppShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const session = useAuthSession();
    const pushNotification = useNotificationStore((state) => state.push);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        clearAuthSession();
        pushNotification('info', 'Session closed.');
        router.push('/login');
        router.refresh();
    };

    return (
        <div className="flex min-h-screen flex-col bg-[#f3f3f3] text-gray-900">
            <Navbar
                mode={session.authenticated ? 'authenticated' : 'guest'}
                userName={session.username ?? session.displayName}
                userAvatar={session.avatarUrl}
                onLogout={session.authenticated ? handleLogout : undefined}
            />

            <div className="relative mx-auto flex w-full max-w-[1600px] flex-1">
                {mobileOpen ? (
                    <button
                        type="button"
                        className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                        aria-label="Close menu"
                        onClick={() => setMobileOpen(false)}
                    />
                ) : null}

                <Sidebar mobileOpen={mobileOpen} onRequestCloseMobile={() => setMobileOpen(false)} />

                <main className="min-w-0 flex-1 p-5">
                    <div className="mb-4 flex items-center gap-3 lg:hidden">
                        <button
                            type="button"
                            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50"
                            aria-label="Open menu"
                            onClick={() => setMobileOpen(true)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-5 w-5"
                                aria-hidden
                            >
                                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>
                    {children}
                </main>
            </div>

            <div className="mt-auto">
                <Footer />
            </div>
        </div>
    );
}

