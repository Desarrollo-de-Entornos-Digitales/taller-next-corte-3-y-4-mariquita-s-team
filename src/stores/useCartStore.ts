import { create } from 'zustand';

import type { ApiCart, ApiCartItem } from '../lib/types';
import { addCartItem, checkoutCart, fetchCart, isAuthRequiredError, removeCartItem, updateCartItem } from '../lib/api';

type CartState = {
    cart: ApiCart | null;
    loading: boolean;
    error: string;
    hydrate: () => Promise<void>;
    add: (productId: number, quantity?: number) => Promise<void>;
    update: (itemId: number, quantity: number) => Promise<void>;
    remove: (itemId: number) => Promise<void>;
    checkout: () => Promise<number[]>;
    count: () => number;
    subtotal: () => number;
    items: () => ApiCartItem[];
    clearLocal: () => void;
};

export const useCartStore = create<CartState>((set, get) => ({
    cart: null,
    loading: false,
    error: '',
    hydrate: async () => {
        set({ loading: true, error: '' });
        try {
            const cart = await fetchCart();
            set({ cart });
        } catch (e) {
            if (isAuthRequiredError(e)) {
                set({ error: '', cart: null });
                return;
            }
            const message = e instanceof Error ? e.message : 'Could not load cart.';
            set({ error: message, cart: null });
        } finally {
            set({ loading: false });
        }
    },
    add: async (productId, quantity = 1) => {
        set({ loading: true, error: '' });
        try {
            const cart = await addCartItem(productId, quantity);
            set({ cart });
        } catch (e) {
            if (isAuthRequiredError(e)) {
                set({ error: '' });
                return;
            }
            const message = e instanceof Error ? e.message : 'Could not add item to cart.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    update: async (itemId, quantity) => {
        set({ loading: true, error: '' });
        try {
            const cart = await updateCartItem(itemId, quantity);
            set({ cart });
        } catch (e) {
            if (isAuthRequiredError(e)) {
                set({ error: '' });
                return;
            }
            const message = e instanceof Error ? e.message : 'Could not update cart.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    remove: async (itemId) => {
        set({ loading: true, error: '' });
        try {
            const cart = await removeCartItem(itemId);
            set({ cart });
        } catch (e) {
            if (isAuthRequiredError(e)) {
                set({ error: '' });
                return;
            }
            const message = e instanceof Error ? e.message : 'Could not remove item from cart.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    checkout: async () => {
        set({ loading: true, error: '' });
        try {
            const result = await checkoutCart();
            const cart = await fetchCart();
            set({ cart });
            return result.orderIds ?? [];
        } catch (e) {
            if (isAuthRequiredError(e)) {
                set({ error: '' });
                return [];
            }
            const message = e instanceof Error ? e.message : 'Could not complete checkout.';
            set({ error: message });
            throw e;
        } finally {
            set({ loading: false });
        }
    },
    count: () => {
        const cart = get().cart;
        return (cart?.items ?? []).reduce((acc, item) => acc + (item.quantity ?? 0), 0);
    },
    subtotal: () => {
        const cart = get().cart;
        return (cart?.items ?? []).reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0);
    },
    items: () => get().cart?.items ?? [],
    clearLocal: () => set({ cart: null, error: '' }),
}));
