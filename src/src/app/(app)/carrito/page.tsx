'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';

import Button from '../../../components/ui/Button';
import { useAuthSession } from '../../../hooks/useAuthSession';
import { useCartStore } from '../../../stores/useCartStore';

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function CartPage() {
    const router = useRouter();
    const session = useAuthSession();
    const hydrate = useCartStore((s) => s.hydrate);
    const cart = useCartStore((s) => s.cart);
    const loading = useCartStore((s) => s.loading);
    const error = useCartStore((s) => s.error);
    const subtotal = useCartStore((s) => s.subtotal);
    const update = useCartStore((s) => s.update);
    const remove = useCartStore((s) => s.remove);

    const items = useMemo(() => cart?.items ?? [], [cart?.items]);

    useEffect(() => {
        void hydrate();
    }, [hydrate]);

    const total = subtotal();

    const handleProceedToCheckout = () => {
        if (!session.authenticated) {
            router.push('/login?returnUrl=/carrito');
            return;
        }
        if (items.length === 0) {
            return;
        }
        router.push('/pago/simulado');
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-bold text-gray-900">Cart</h1>
                <Link href="/" className="text-sm font-semibold text-green-700 hover:text-green-800">
                    Continue shopping
                </Link>
            </div>

            {loading ? <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading cart...</p> : null}
            {error ? (
                <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-600" role="alert">
                    {error}
                </p>
            ) : null}

            {!loading && items.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-700">Your cart is empty.</p>
                </div>
            ) : null}

            {items.length > 0 ? (
                <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
                    <section className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                <div className="relative h-20 w-24 overflow-hidden rounded-xl bg-gray-200">
                                    {item.product.imageUrl ? (
                                        <Image
                                            src={item.product.imageUrl}
                                            alt={item.product.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : null}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-gray-900">{item.product.title}</p>
                                    <p className="mt-1 text-xs text-gray-600">
                                        {formatPrice(Number(item.unitPrice))} each
                                    </p>
                                    <div className="mt-3 flex flex-wrap items-center gap-3">
                                        <label className="text-xs font-semibold text-gray-600">Quantity</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const q = Number(e.target.value);
                                                if (Number.isFinite(q) && q >= 1) {
                                                    void update(item.id, q);
                                                }
                                            }}
                                            className="w-24 rounded-md border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-green-700"
                                        />
                                        <button
                                            type="button"
                                            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                                            onClick={() => void remove(item.id)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>

                                <div className="shrink-0 text-right">
                                    <p className="text-sm font-bold text-gray-900">
                                        {formatPrice(Number(item.unitPrice) * item.quantity)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </section>

                    <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Resumen</h2>
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatPrice(total)}</span>
                            </div>
                            <div className="flex items-center justify-between text-gray-700">
                                <span>Total</span>
                                <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
                            </div>
                        </div>

                        <div className="mt-5">
                            <Button
                                type="button"
                                disabled={loading || items.length === 0}
                                onClick={handleProceedToCheckout}
                                data-testid="cart-checkout-button"
                            >
                                Proceed to checkout
                            </Button>
                        </div>
                    </aside>
                </div>
            ) : null}
        </div>
    );
}
