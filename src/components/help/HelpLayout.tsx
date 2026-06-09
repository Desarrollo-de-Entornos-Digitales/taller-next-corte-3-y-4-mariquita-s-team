import Link from 'next/link';
import type { ReactNode } from 'react';

const helpNav = [
    { label: 'Help Center', href: '/help' },
    { label: 'Getting Started', href: '/help/getting-started' },
    { label: 'Buying Guide', href: '/help/buying' },
    { label: 'Selling Guide', href: '/help/selling' },
    { label: 'Contact Support', href: '/help/contact' },
];

type HelpLayoutProps = {
    title: string;
    subtitle?: string;
    children: ReactNode;
};

export default function HelpLayout({ title, subtitle, children }: HelpLayoutProps) {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <div className="mb-6">
                <Link href="/help" className="text-sm font-medium text-green-700 hover:text-green-800">
                    ← Back to Help Center
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
                <aside className="hidden lg:block">
                    <nav className="sticky top-6 space-y-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        {helpNav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-green-50 hover:text-green-800"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {subtitle ? <p className="mt-2 text-sm text-gray-600">{subtitle}</p> : null}
                    <div className="mt-6 space-y-6">{children}</div>
                </div>
            </div>
        </div>
    );
}
