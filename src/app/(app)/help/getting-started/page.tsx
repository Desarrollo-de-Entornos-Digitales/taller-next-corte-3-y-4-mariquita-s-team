import Link from 'next/link';

import HelpLayout from '../../../../components/help/HelpLayout';

const steps = [
    {
        title: '1. Create your account',
        body: 'Go to Sign Up and register with your email, username, and password. You will be guided through profile setup right after.',
    },
    {
        title: '2. Choose your role',
        body: 'Select Buyer if you want to purchase products, or Seller if you want to publish listings. You can update your profile description anytime.',
    },
    {
        title: '3. Complete your profile',
        body: 'Add a photo, short bio, and profile description so other users know who they are dealing with.',
    },
    {
        title: '4. Start using VincoBov',
        body: 'Buyers can browse the feed, save favorites, and message sellers. Sellers can post products from the Post section.',
    },
];

export default function GettingStartedPage() {
    return (
        <HelpLayout
            title="Getting Started"
            subtitle="Set up your VincoBov account in a few minutes."
        >
            <ol className="space-y-4">
                {steps.map((step) => (
                    <li key={step.title} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                        <h2 className="text-sm font-bold text-gray-900">{step.title}</h2>
                        <p className="mt-1 text-sm text-gray-600">{step.body}</p>
                    </li>
                ))}
            </ol>

            <div className="flex flex-wrap gap-3">
                <Link
                    href="/registro"
                    className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800"
                >
                    Create account
                </Link>
                <Link
                    href="/login"
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Log in
                </Link>
            </div>
        </HelpLayout>
    );
}
