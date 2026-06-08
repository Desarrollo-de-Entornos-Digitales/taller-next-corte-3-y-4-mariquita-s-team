'use client';

import type { ReactNode } from 'react';

import NotificationToasts from '../NotificationToasts';

export default function AppProviders({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <NotificationToasts />
        </>
    );
}
