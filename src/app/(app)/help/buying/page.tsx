import Link from 'next/link';

import HelpLayout from '../../../../components/help/HelpLayout';

export default function BuyingGuidePage() {
    return (
        <HelpLayout title="Buying Guide" subtitle="Everything you need to know to purchase on VincoBov.">
            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Browse & filter</h2>
                <p className="text-sm text-gray-600">
                    Use the category filters on the home feed to find Livestock, Agriculture, Refined products, or
                    Supplies & Equipment. You can also search by keyword from the navbar.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Save favorites</h2>
                <p className="text-sm text-gray-600">
                    On any product page, click &quot;Save favorite&quot; to keep items for later. View all saved
                    products in the Favorites section from the sidebar.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Contact sellers</h2>
                <p className="text-sm text-gray-600">
                    Open a product and click &quot;Contact seller&quot; to start a conversation. All your chats are
                    stored in Messages, with the conversation list on the left and the full chat on the right.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Purchase options</h2>
                <p className="text-sm text-gray-600">
                    Add products to your cart and proceed to checkout when you are ready to pay from the Cart page.
                </p>
            </section>

            <div className="flex flex-wrap gap-3">
                <Link
                    href="/"
                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                    Browse products
                </Link>
                <Link
                    href="/favoritos"
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    View favorites
                </Link>
            </div>
        </HelpLayout>
    );
}
