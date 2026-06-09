import { Suspense } from 'react';

import SimulatedPaymentClient from './SimulatedPaymentClient';

export default function SimulatedPaymentPage() {
    return (
        <Suspense fallback={<p className="rounded-lg bg-white p-3 text-sm text-gray-700">Preparing simulated payment...</p>}>
            <SimulatedPaymentClient />
        </Suspense>
    );
}

