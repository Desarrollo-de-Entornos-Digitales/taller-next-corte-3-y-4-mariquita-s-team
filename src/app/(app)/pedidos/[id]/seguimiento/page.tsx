import { Suspense } from 'react';

import OrderTrackingClient from './OrderTrackingClient';

export default function OrderTrackingPage() {
    return (
        <Suspense
            fallback={<p className="rounded-lg bg-white p-3 text-sm text-gray-700">Preparing order tracking...</p>}
        >
            <OrderTrackingClient />
        </Suspense>
    );
}
