import Link from 'next/link';

import HelpLayout from '../../../../components/help/HelpLayout';

export default function SellingGuidePage() {
    return (
        <HelpLayout
            title="Selling Guide"
            subtitle="Publish and manage your agricultural listings."
        >
            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Seller account required</h2>
                <p className="text-sm text-gray-600">
                    Only seller accounts can post products. During registration, choose Seller in the profile setup step,
                    or sign in with a seller test account.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Post a product</h2>
                <p className="text-sm text-gray-600">
                    Go to Post and fill in the title, description, category, price, stock, location, and an optional
                    image URL. A live preview is shown on the right before you publish.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Categories</h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600">
                    <li>Livestock — cattle, sheep, poultry, and other animals</li>
                    <li>Agriculture — fresh produce such as potatoes, vegetables, and grains</li>
                    <li>Refined — processed and packaged products</li>
                    <li>Supplies & Equipment — tractors, fences, feeders, milking equipment, and more</li>
                </ul>
            </section>

            <section className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Respond to buyers</h2>
                <p className="text-sm text-gray-600">
                    When a buyer contacts you from a product page, the conversation appears in Messages. Reply promptly
                    to build trust and close deals faster.
                </p>
            </section>

            <div className="flex flex-wrap gap-3">
                <Link
                    href="/productos/nuevo"
                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                    Post a product
                </Link>
                <Link
                    href="/mis-posts"
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    View my posts
                </Link>
            </div>
        </HelpLayout>
    );
}
