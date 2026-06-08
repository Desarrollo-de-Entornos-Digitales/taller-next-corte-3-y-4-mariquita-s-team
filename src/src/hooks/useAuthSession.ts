'use client';

import { useSyncExternalStore } from 'react';

import {
    formatDisplayName,
    getAuthSessionServerSnapshot,
    getAuthSessionSnapshot,
    subscribeAuthSession,
} from '../lib/auth';

export function useAuthSession() {
    const snapshot = useSyncExternalStore(subscribeAuthSession, getAuthSessionSnapshot, getAuthSessionServerSnapshot);
    const ready = useSyncExternalStore(
        () => () => {},
        () => true,
        () => false,
    );

    const displayName = snapshot.username ?? formatDisplayName(snapshot.email);

    return {
        ready,
        authenticated: snapshot.authenticated,
        userId: snapshot.userId,
        email: snapshot.email,
        username: snapshot.username,
        role: snapshot.role,
        avatarUrl: snapshot.avatarUrl,
        displayName,
        isSeller: snapshot.role === 'seller' || snapshot.role === 'admin',
        isBuyer: snapshot.role === 'buyer',
    };
}
