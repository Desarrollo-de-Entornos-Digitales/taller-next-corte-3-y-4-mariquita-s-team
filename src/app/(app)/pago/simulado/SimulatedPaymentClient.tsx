'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import AlertBanner from '../../../../components/ui/AlertBanner';
import Button from '../../../../components/ui/Button';
import TextField from '../../../../components/ui/TextField';
import { useAuthSession } from '../../../../hooks/useAuthSession';
import { fetchCart } from '../../../../lib/api';
import type { ApiCartItem } from '../../../../lib/types';
import { useCartStore } from '../../../../stores/useCartStore';
import { useNotificationStore } from '../../../../stores/useNotificationStore';

type PaymentMethodId = 'card' | 'pse' | 'transfer' | 'cod';

type PaymentMethodOption = {
    id: PaymentMethodId;
    label: string;
    description: string;
    icon: string;
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
    {
        id: 'card',
        label: 'Credit / debit card',
        description: 'Visa, Mastercard, or Amex (simulated).',
        icon: '💳',
    },
    {
        id: 'pse',
        label: 'PSE',
        description: 'Debit from your Colombian bank account.',
        icon: '🏦',
    },
    {
        id: 'transfer',
        label: 'Bank transfer',
        description: 'Manual transfer with payment reference.',
        icon: '🔁',
    },
    {
        id: 'cod',
        label: 'Cash on delivery',
        description: 'Pay the carrier when you receive the order.',
        icon: '💵',
    },
];

const PSE_BANKS = ['Bancolombia', 'Davivienda', 'Banco de Bogotá', 'BBVA Colombia', 'Nequi', 'Daviplata'];

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(price);
}

const STEPS = [
    { id: 1, label: 'Order' },
    { id: 2, label: 'Shipping' },
    { id: 3, label: 'Payment' },
    { id: 4, label: 'Details' },
    { id: 5, label: 'Confirm' },
] as const;

function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <ol className="mb-6 flex flex-wrap items-center justify-center gap-2" data-testid="checkout-steps">
            {STEPS.map((step, index) => {
                const active = currentStep === step.id;
                const completed = currentStep > step.id;
                return (
                    <li key={step.id} className="flex items-center gap-2">
                        <span
                            className={`flex h-8 min-w-8 items-center justify-center rounded-full text-xs font-bold ${
                                active
                                    ? 'bg-green-700 text-white'
                                    : completed
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-500'
                            }`}
                        >
                            {step.id}
                        </span>
                        <span className={`text-xs font-semibold ${active ? 'text-green-800' : 'text-gray-500'}`}>
                            {step.label}
                        </span>
                        {index < STEPS.length - 1 ? <span className="mx-1 text-gray-300">›</span> : null}
                    </li>
                );
            })}
        </ol>
    );
}

export default function SimulatedPaymentClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const session = useAuthSession();
    const pushNotification = useNotificationStore((state) => state.push);

    const checkoutCart = useCartStore((state) => state.checkout);

    const [step, setStep] = useState(() => {
        const parsedStep = Number(searchParams.get('previewStep'));
        if (Number.isFinite(parsedStep) && parsedStep >= 1 && parsedStep <= 5) {
            return parsedStep;
        }
        return 1;
    });
    const [cartItems, setCartItems] = useState<ApiCartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(() => {
        const method = searchParams.get('previewMethod') as PaymentMethodId | null;
        return method && PAYMENT_METHODS.some((item) => item.id === method) ? method : 'card';
    });
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const [recipientName, setRecipientName] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [deliveryNotes, setDeliveryNotes] = useState('');

    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');

    const [pseBank, setPseBank] = useState(PSE_BANKS[0]);
    const [pseDocument, setPseDocument] = useState('');
    const [pseEmail, setPseEmail] = useState('');

    const [transferReference, setTransferReference] = useState('');

    useEffect(() => {
        if (!session.ready) {
            return;
        }

        if (!session.authenticated) {
            router.replace('/login');
            return;
        }

        const load = async () => {
            try {
                const cart = await fetchCart();
                setCartItems(cart.items ?? []);
                if ((cart.items ?? []).length === 0) {
                    setError('Your cart is empty. Add products before checking out.');
                }
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : 'Error loading cart.');
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [session.ready, session.authenticated, router]);

    const displayError = error;
    const hasCartItems = cartItems.length > 0;

    const total = useMemo(
        () => cartItems.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0),
        [cartItems],
    );

    const totalUnits = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);

    const formattedTotal = useMemo(
        () =>
            new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
            }).format(total),
        [total],
    );

    const selectedMethod = PAYMENT_METHODS.find((method) => method.id === paymentMethod);

    const validateStep = () => {
        if (step === 1 && !hasCartItems) {
            setError('Your cart is empty. Add products before checking out.');
            return false;
        }

        if (step === 2) {
            if (!recipientName.trim()) {
                setError('Enter the recipient full name.');
                return false;
            }
            if (!address.trim()) {
                setError('Enter the delivery address.');
                return false;
            }
            if (!city.trim()) {
                setError('Enter the city.');
                return false;
            }
            if (!phone.trim() || phone.trim().length < 7) {
                setError('Enter a valid contact phone number.');
                return false;
            }
        }

        if (step === 4) {
            if (paymentMethod === 'card') {
                if (!cardName.trim()) {
                    setError('Enter the cardholder name.');
                    return false;
                }
                if (cardNumber.replace(/\s/g, '').length < 12) {
                    setError('Enter a valid card number (simulated).');
                    return false;
                }
                if (!/^\d{2}\/\d{2}$/.test(cardExpiry.trim())) {
                    setError('Enter expiry as MM/YY.');
                    return false;
                }
                if (cardCvv.trim().length < 3) {
                    setError('Enter a valid CVV.');
                    return false;
                }
            }

            if (paymentMethod === 'pse') {
                if (!pseDocument.trim()) {
                    setError('Enter your document number for PSE.');
                    return false;
                }
                if (!pseEmail.trim() || !pseEmail.includes('@')) {
                    setError('Enter a valid email for PSE.');
                    return false;
                }
            }

            if (paymentMethod === 'transfer') {
                if (!transferReference.trim()) {
                    setError('Enter the bank transfer reference.');
                    return false;
                }
            }
        }

        setError('');
        return true;
    };

    const handleContinue = () => {
        if (!validateStep()) {
            return;
        }

        if (step === 3 && paymentMethod === 'cod') {
            setStep(5);
            return;
        }

        setStep((prev) => Math.min(prev + 1, 5));
    };

    const handleBack = () => {
        setError('');
        if (step === 5 && paymentMethod === 'cod') {
            setStep(3);
            return;
        }
        setStep((prev) => Math.max(prev - 1, 1));
    };

    const confirmPayment = async () => {
        if (!validateStep() || !hasCartItems) {
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const orderIds = await checkoutCart();
            pushNotification('success', 'Payment completed. Your order is being prepared for shipment.');
            const orderId = orderIds[0];
            if (orderId) {
                router.push(`/pedidos/${orderId}/seguimiento`);
                return;
            }
            pushNotification('info', 'Purchase completed, but tracking is unavailable for this order.');
            router.push('/');
        } catch (purchaseError) {
            const message = purchaseError instanceof Error ? purchaseError.message : 'Unable to complete payment.';
            setError(message);
            pushNotification('error', message);
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirmPayment = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void confirmPayment();
    };

    if (!session.ready || loading) {
        return <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading checkout...</p>;
    }

    return (
        <div className="mx-auto w-full max-w-4xl" data-testid="checkout-flow">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
                <div className="mb-2 text-center">
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#2f7d4d]">Secure checkout</p>
                    <h1 className="mt-1 text-3xl font-bold text-gray-900">Complete your purchase</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Review your order, enter shipping details, and choose how you want to pay.
                    </p>
                </div>

                <StepIndicator currentStep={step} />

                {displayError && step !== 5 && hasCartItems ? (
                    <div className="mb-4">
                        <AlertBanner variant="error" message={displayError} />
                    </div>
                ) : null}

                {hasCartItems ? (
                    <form className="space-y-5" onSubmit={handleConfirmPayment}>
                        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-900">
                            {cartItems.length} item{cartItems.length === 1 ? '' : 's'} in cart — Total:{' '}
                            <span className="font-semibold">{formattedTotal}</span>
                        </div>

                        {step === 1 ? (
                            <section className="space-y-4 rounded-xl border border-gray-200 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
                                    <Link
                                        href="/carrito"
                                        className="text-sm font-semibold text-green-700 hover:text-green-800"
                                    >
                                        Edit cart
                                    </Link>
                                </div>
                                <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                                    {cartItems.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                                        >
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-gray-900">
                                                    {item.product.title}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {item.quantity} × {formatPrice(Number(item.unitPrice))}
                                                </p>
                                            </div>
                                            <p className="shrink-0 font-semibold text-gray-900">
                                                {formatPrice(Number(item.unitPrice) * item.quantity)}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-sm text-gray-600">
                                    Review your cart items before continuing to shipping and payment.
                                </p>
                            </section>
                        ) : null}

                        {step === 2 ? (
                            <section
                                className="space-y-4 rounded-xl border border-gray-200 p-5"
                                data-testid="shipping-step"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">Shipping details</h2>
                                <TextField
                                    label="Recipient full name"
                                    value={recipientName}
                                    onChange={(event) => setRecipientName(event.target.value)}
                                    placeholder="E.g. Maria Lopez"
                                    required
                                />
                                <TextField
                                    label="Delivery address"
                                    value={address}
                                    onChange={(event) => setAddress(event.target.value)}
                                    placeholder="Street, number, neighborhood"
                                    required
                                />
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <TextField
                                        label="City"
                                        value={city}
                                        onChange={(event) => setCity(event.target.value)}
                                        placeholder="E.g. Tunja"
                                        required
                                    />
                                    <TextField
                                        label="Contact phone"
                                        value={phone}
                                        onChange={(event) => setPhone(event.target.value)}
                                        placeholder="300 123 4567"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        Delivery notes (optional)
                                    </label>
                                    <textarea
                                        className="min-h-24 w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700"
                                        value={deliveryNotes}
                                        onChange={(event) => setDeliveryNotes(event.target.value)}
                                        placeholder="Gate code, preferred time window, landmarks..."
                                    />
                                </div>
                            </section>
                        ) : null}

                        {step === 3 ? (
                            <section
                                className="space-y-4 rounded-xl border border-gray-200 p-5"
                                data-testid="payment-method-step"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">Choose payment method</h2>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {PAYMENT_METHODS.map((method) => {
                                        const selected = paymentMethod === method.id;
                                        return (
                                            <button
                                                key={method.id}
                                                type="button"
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`rounded-xl border p-4 text-left transition ${
                                                    selected
                                                        ? 'border-green-700 bg-green-50 ring-2 ring-green-100'
                                                        : 'border-gray-200 hover:border-green-400'
                                                }`}
                                                data-testid={`payment-method-${method.id}`}
                                            >
                                                <span className="text-2xl">{method.icon}</span>
                                                <p className="mt-2 font-semibold text-gray-900">{method.label}</p>
                                                <p className="mt-1 text-xs text-gray-600">{method.description}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ) : null}

                        {step === 4 ? (
                            <section
                                className="space-y-4 rounded-xl border border-gray-200 p-5"
                                data-testid="payment-details-step"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">{selectedMethod?.label} details</h2>

                                {paymentMethod === 'card' ? (
                                    <div className="space-y-4">
                                        <TextField
                                            label="Cardholder name"
                                            value={cardName}
                                            onChange={(event) => setCardName(event.target.value)}
                                            placeholder="As printed on the card"
                                        />
                                        <TextField
                                            label="Card number"
                                            value={cardNumber}
                                            onChange={(event) => setCardNumber(event.target.value)}
                                            placeholder="1234 5678 9012 3456"
                                        />
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <TextField
                                                label="Expiry (MM/YY)"
                                                value={cardExpiry}
                                                onChange={(event) => setCardExpiry(event.target.value)}
                                                placeholder="08/28"
                                            />
                                            <TextField
                                                label="CVV"
                                                value={cardCvv}
                                                onChange={(event) => setCardCvv(event.target.value)}
                                                placeholder="123"
                                            />
                                        </div>
                                    </div>
                                ) : null}

                                {paymentMethod === 'pse' ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1 block text-sm font-medium text-gray-700">Bank</label>
                                            <select
                                                className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm outline-none focus:border-green-700"
                                                value={pseBank}
                                                onChange={(event) => setPseBank(event.target.value)}
                                            >
                                                {PSE_BANKS.map((bank) => (
                                                    <option key={bank} value={bank}>
                                                        {bank}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <TextField
                                            label="Document number"
                                            value={pseDocument}
                                            onChange={(event) => setPseDocument(event.target.value)}
                                            placeholder="National ID or NIT"
                                        />
                                        <TextField
                                            label="Email for PSE receipt"
                                            type="email"
                                            value={pseEmail}
                                            onChange={(event) => setPseEmail(event.target.value)}
                                            placeholder="you@email.com"
                                        />
                                        <p className="rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-800">
                                            You will be redirected to your bank portal in a real PSE flow. This is a
                                            simulated checkout.
                                        </p>
                                    </div>
                                ) : null}

                                {paymentMethod === 'transfer' ? (
                                    <div className="space-y-4">
                                        <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-700">
                                            <p className="font-semibold text-gray-900">VincoBov collection account</p>
                                            <p className="mt-1">Bancolombia · Savings · 123-456789-01</p>
                                            <p>NIT 900.123.456-7</p>
                                        </div>
                                        <TextField
                                            label="Transfer reference"
                                            value={transferReference}
                                            onChange={(event) => setTransferReference(event.target.value)}
                                            placeholder="Reference or voucher number"
                                        />
                                    </div>
                                ) : null}
                            </section>
                        ) : null}

                        {step === 5 ? (
                            <section
                                className="space-y-4 rounded-xl border border-gray-200 p-5"
                                data-testid="confirm-step"
                            >
                                <h2 className="text-lg font-semibold text-gray-900">Review and pay</h2>
                                <div className="grid gap-3 text-sm text-gray-700 sm:grid-cols-2">
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="font-semibold text-gray-900">Shipping</p>
                                        <p className="mt-2">{recipientName}</p>
                                        <p>{address}</p>
                                        <p>
                                            {city} · {phone}
                                        </p>
                                        {deliveryNotes ? (
                                            <p className="mt-2 text-xs text-gray-500">{deliveryNotes}</p>
                                        ) : null}
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-4">
                                        <p className="font-semibold text-gray-900">Payment</p>
                                        <p className="mt-2">{selectedMethod?.label}</p>
                                        <p className="mt-2 text-2xl font-bold text-[#2f7d4d]">{formattedTotal}</p>
                                        <p className="text-xs text-gray-500">{totalUnits} unit(s)</p>
                                    </div>
                                </div>
                                {error ? <AlertBanner variant="error" message={error} /> : null}
                            </section>
                        ) : null}

                        <div className="flex flex-wrap gap-3">
                            {step < 5 ? (
                                <Button type="button" onClick={handleContinue} data-testid="checkout-continue-button">
                                    Continue
                                </Button>
                            ) : (
                                <Button type="submit" disabled={processing} data-testid="checkout-pay-button">
                                    {processing ? 'Processing payment...' : 'Pay and place order'}
                                </Button>
                            )}
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={handleBack}>
                                    Back
                                </Button>
                            ) : null}
                            <Link
                                href="/"
                                className="rounded-md border border-green-700 px-4 py-2 text-sm font-semibold text-green-700"
                            >
                                Back to feed
                            </Link>
                        </div>
                    </form>
                ) : null}

                {!loading && !hasCartItems ? (
                    <div className="space-y-4 rounded-xl border border-gray-200 p-5 text-center">
                        {displayError ? <AlertBanner variant="error" message={displayError} /> : null}
                        <p className="text-sm text-gray-700">Add products to your cart to start checkout.</p>
                        <div className="flex flex-wrap justify-center gap-3">
                            <Link
                                href="/carrito"
                                className="rounded-md border border-green-700 px-4 py-2 text-sm font-semibold text-green-700"
                            >
                                Go to cart
                            </Link>
                            <Link
                                href="/"
                                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700"
                            >
                                Continue shopping
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
