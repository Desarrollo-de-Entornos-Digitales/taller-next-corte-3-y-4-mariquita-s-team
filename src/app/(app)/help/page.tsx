import Link from 'next/link';

const topics = [
    {
        title: 'Getting Started',
        description: 'Create your account, choose your role, and set up your profile.',
        href: '/help/getting-started',
        icon: '🚀',
    },
    {
        title: 'Buying Guide',
        description: 'Browse products, save favorites, contact sellers, and complete purchases.',
        href: '/help/buying',
        icon: '🛒',
    },
    {
        title: 'Selling Guide',
        description: 'Post products, manage listings, and respond to buyer messages.',
        href: '/help/selling',
        icon: '🏷️',
    },
    {
        title: 'Contact Support',
        description: 'Reach our team for account issues, payments, or technical help.',
        href: '/help/contact',
        icon: '💬',
    },
];

const faqs = [
    {
        q: 'Do I need an account to browse products?',
        a: 'No. You can explore the feed without signing in. An account is required to buy, sell, message sellers, or save favorites.',
    },
    {
        q: 'What is the difference between a buyer and a seller?',
        a: 'Buyers can purchase products, message sellers, and manage a cart. Sellers can publish listings and receive messages from buyers.',
    },
    {
        q: 'How do I contact a seller?',
        a: 'Open any product page and click "Contact seller". This opens a chat in the Messages section.',
    },
    {
        q: 'Which product categories are available?',
        a: 'Livestock, Agriculture, Refined products, and Supplies & Equipment (tools, machinery, and farm inputs).',
    },
];

export default function HelpCenterPage() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8">
            <div className="rounded-3xl bg-gradient-to-br from-[#1a3d28] to-[#2f7d4d] p-8 text-white shadow-lg md:p-10">
                <p className="text-xs font-bold uppercase tracking-widest text-white/60">Help Center</p>
                <h1 className="mt-2 text-3xl font-bold md:text-4xl">How can we help you?</h1>
                <p className="mt-3 max-w-xl text-sm text-white/80">
                    Find guides for buying, selling, and using VincoBov. Everything you need to get the most out of the
                    marketplace.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                {topics.map((topic) => (
                    <Link
                        key={topic.href}
                        href={topic.href}
                        className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-green-300 hover:shadow-md"
                    >
                        <span className="text-2xl" aria-hidden>
                            {topic.icon}
                        </span>
                        <h2 className="mt-3 text-lg font-bold text-gray-900 group-hover:text-green-800">
                            {topic.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">{topic.description}</p>
                        <p className="mt-3 text-sm font-semibold text-green-700">Read guide →</p>
                    </Link>
                ))}
            </div>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:p-8">
                <h2 className="text-xl font-bold text-gray-900">Frequently asked questions</h2>
                <div className="mt-5 space-y-4">
                    {faqs.map((item) => (
                        <details
                            key={item.q}
                            className="group rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 open:bg-white"
                        >
                            <summary className="cursor-pointer list-none text-sm font-semibold text-gray-900 marker:content-none">
                                {item.q}
                            </summary>
                            <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.a}</p>
                        </details>
                    ))}
                </div>
            </section>
        </div>
    );
}
