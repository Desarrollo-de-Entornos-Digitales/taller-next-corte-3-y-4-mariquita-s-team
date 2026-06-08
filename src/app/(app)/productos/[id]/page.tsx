'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

import AlertBanner from '../../../../components/ui/AlertBanner';
import Button from '../../../../components/ui/Button';
import { getCategoryLabel } from '../../../../lib/categories';
import { useAuthSession } from '../../../../hooks/useAuthSession';
import {
    addFavorite,
    checkFavorite,
    createProductReview,
    fetchProductById,
    fetchProductReviews,
    findOrCreateChat,
    isAuthRequiredError,
    removeFavorite,
} from '../../../../lib/api';
import type { ApiProduct, ApiProductReview } from '../../../../lib/types';
import { useCartStore } from '../../../../stores/useCartStore';
import { useNotificationStore } from '../../../../stores/useNotificationStore';

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(price);
}

function formatDate(value?: string) {
    if (!value) return 'Recently listed';
    return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function StarRating({ value, onChange }: { value: number; onChange?: (value: number) => void }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`text-xl ${star <= value ? 'text-amber-400' : 'text-gray-300'} ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => onChange?.(star)}
                    aria-label={`${star} stars`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

function SpecCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
        </div>
    );
}

export default function ProductDetailPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const session = useAuthSession();
    const addToCart = useCartStore((s) => s.add);
    const pushNotification = useNotificationStore((s) => s.push);
    const productId = Number(params.id);
    const isValidProductId = Number.isFinite(productId);
    const idError = isValidProductId ? '' : 'Invalid product identifier.';

    const [product, setProduct] = useState<ApiProduct | null>(null);
    const [reviews, setReviews] = useState<ApiProductReview[]>([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(isValidProductId);
    const [error, setError] = useState('');
    const [contacting, setContacting] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        if (!isValidProductId) return;

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const [data, reviewData] = await Promise.all([
                    fetchProductById(productId),
                    fetchProductReviews(productId),
                ]);
                setProduct(data);
                setReviews(reviewData);

                if (session.authenticated) {
                    const favorite = await checkFavorite(productId);
                    setIsFavorite(favorite);
                }
            } catch (loadError) {
                const message = loadError instanceof Error ? loadError.message : 'Error loading product.';
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        void load();
    }, [productId, isValidProductId, session.authenticated]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return 0;
        const total = reviews.reduce((sum, review) => sum + review.rating, 0);
        return total / reviews.length;
    }, [reviews]);

    const seller = product?.createdBy;
    const displayError = idError || error;
    const stock = product?.stock ?? 0;
    const inStock = stock > 0;

    const handleAddToCart = async () => {
        if (!session.authenticated) {
            router.push('/login');
            return;
        }
        try {
            await addToCart(productId, 1);
            pushNotification('success', 'Product added to cart.');
        } catch (e) {
            if (isAuthRequiredError(e)) {
                return;
            }
            const message = e instanceof Error ? e.message : 'Could not add to cart.';
            pushNotification('error', message);
        }
    };

    const handleToggleFavorite = async () => {
        if (!session.authenticated) {
            router.push('/login');
            return;
        }
        try {
            if (isFavorite) {
                await removeFavorite(productId);
                setIsFavorite(false);
                pushNotification('info', 'Removed from favorites.');
            } else {
                await addFavorite(productId);
                setIsFavorite(true);
                pushNotification('success', 'Added to favorites.');
            }
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not update favorites.';
            pushNotification('error', message);
        }
    };

    const handleContactSeller = async () => {
        if (!session.authenticated || !session.userId || !seller?.id) {
            router.push('/login');
            return;
        }

        if (seller.id === session.userId) {
            pushNotification('info', 'This is your own listing.');
            return;
        }

        setContacting(true);
        try {
            const chat = await findOrCreateChat({
                sellerId: seller.id,
                buyerId: session.userId,
            });
            router.push(`/mensajes?chatId=${chat.id}`);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not start conversation.';
            pushNotification('error', message);
        } finally {
            setContacting(false);
        }
    };

    const handleSubmitReview = async (event: FormEvent) => {
        event.preventDefault();
        if (!session.authenticated) {
            router.push('/login');
            return;
        }
        if (!reviewComment.trim()) return;

        setSubmittingReview(true);
        try {
            await createProductReview({
                productId,
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            const reviewData = await fetchProductReviews(productId);
            setReviews(reviewData);
            setReviewComment('');
            setReviewRating(5);
            pushNotification('success', 'Review submitted.');
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Could not submit review.';
            pushNotification('error', message);
        } finally {
            setSubmittingReview(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-6xl">
            {displayError && (
                <div className="mb-4">
                    <AlertBanner variant="error" message={displayError} />
                </div>
            )}

            {loading && <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading product...</p>}

            {!loading && product && (
                <div className="space-y-6" data-testid="product-detail">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <Link href="/" className="text-sm font-semibold text-green-700 hover:text-green-800">
                            ← Back to feed
                        </Link>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                inStock ? 'bg-green-50 text-green-800' : 'bg-rose-50 text-rose-700'
                            }`}
                        >
                            {inStock ? `${stock} in stock` : 'Out of stock'}
                        </span>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                        <div className="space-y-4">
                            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
                                <div className="relative aspect-[5/4] bg-gradient-to-br from-[#edf5ef] to-[#d9e8de]">
                                    {product.imageUrl ? (
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.title}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            className="object-cover"
                                            priority
                                        />
                                    ) : (
                                        <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
                                            <span className="text-4xl">📦</span>
                                            <span className="text-sm">No image available</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-green-800">
                                        {getCategoryLabel(product.category)}
                                    </span>
                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                        {product.location ?? 'Colombia'}
                                    </span>
                                </div>
                                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 lg:text-4xl">
                                    {product.title}
                                </h1>
                                <p className="mt-4 text-base leading-relaxed text-gray-700">{product.description}</p>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <SpecCard label="Category" value={getCategoryLabel(product.category)} />
                                    <SpecCard label="Location" value={product.location ?? 'Colombia'} />
                                    <SpecCard label="Available stock" value={`${stock} units`} />
                                    <SpecCard label="Listed on" value={formatDate(product.createdAt)} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 lg:sticky lg:top-5 lg:self-start">
                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Price</p>
                                <p className="mt-2 text-4xl font-bold text-[#1f4f32]">
                                    {formatPrice(Number(product.price))}
                                </p>
                                <div className="mt-4 flex items-center gap-2">
                                    <StarRating value={Math.round(averageRating)} />
                                    <span className="text-sm text-gray-600">
                                        {reviews.length > 0
                                            ? `${averageRating.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? '' : 's'}`
                                            : 'No reviews yet'}
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <Button
                                        type="button"
                                        onClick={() => void handleAddToCart()}
                                        disabled={!isValidProductId || !inStock}
                                        data-testid="add-to-cart-button"
                                    >
                                        Add to cart
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => void handleToggleFavorite()}
                                        className={`w-full rounded-md border px-4 py-2.5 text-sm font-semibold transition ${
                                            isFavorite
                                                ? 'border-amber-300 bg-amber-50 text-amber-700'
                                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                    >
                                        {isFavorite ? '★ Saved to favorites' : '☆ Save to favorites'}
                                    </button>
                                </div>

                                <div className="mt-5 rounded-2xl border border-green-100 bg-green-50/70 p-4 text-sm text-green-900">
                                    <p className="font-semibold">Secure marketplace purchase</p>
                                    <p className="mt-1 text-xs leading-relaxed text-green-800">
                                        Buy directly from verified sellers. Contact the seller before purchasing if you
                                        need delivery or volume details.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                                <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Seller</p>
                                <div className="mt-4 flex items-start gap-4">
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-green-100">
                                        {seller?.avatarUrl ? (
                                            <Image
                                                src={seller.avatarUrl}
                                                alt={seller.username ?? 'Seller'}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-green-700">
                                                {(seller?.username ?? 'S').charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {seller?.username ?? 'VincoBov Seller'}
                                        </p>
                                        <p className="mt-1 text-sm capitalize text-gray-500">
                                            {seller?.role?.name ?? 'seller'} account
                                        </p>
                                        <p className="mt-2 text-sm leading-relaxed text-gray-600">
                                            {seller?.profileDescription ??
                                                seller?.bio ??
                                                'Agricultural seller on VincoBov.'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-5"
                                    onClick={() => void handleContactSeller()}
                                    disabled={contacting}
                                >
                                    {contacting ? 'Opening chat...' : 'Contact seller'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Reviews & comments</h2>
                                <p className="mt-1 text-sm text-gray-600">
                                    See what other buyers think about this listing.
                                </p>
                            </div>
                            <p className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                {reviews.length} total
                            </p>
                        </div>

                        <form
                            className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-5"
                            onSubmit={(e) => void handleSubmitReview(e)}
                        >
                            <p className="text-sm font-semibold text-gray-800">Leave a review</p>
                            <div className="mt-2">
                                <StarRating value={reviewRating} onChange={setReviewRating} />
                            </div>
                            <textarea
                                className="mt-3 min-h-24 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100"
                                placeholder="Share your experience with this product..."
                                value={reviewComment}
                                onChange={(event) => setReviewComment(event.target.value)}
                            />
                            <Button
                                type="submit"
                                className="mt-3 w-auto px-6"
                                disabled={submittingReview || !reviewComment.trim()}
                            >
                                {submittingReview ? 'Submitting...' : 'Submit review'}
                            </Button>
                        </form>

                        <div className="mt-6 space-y-4">
                            {reviews.length === 0 ? (
                                <p className="rounded-2xl border border-dashed border-gray-200 p-6 text-sm text-gray-600">
                                    Be the first to review this product.
                                </p>
                            ) : (
                                reviews.map((review) => (
                                    <article
                                        key={review.id}
                                        className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                                    {(review.user?.username ?? 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {review.user?.username ?? 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <StarRating value={review.rating} />
                                        </div>
                                        <p className="mt-3 text-sm leading-relaxed text-gray-700">{review.comment}</p>
                                    </article>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
