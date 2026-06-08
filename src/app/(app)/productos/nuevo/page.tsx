'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AlertBanner from '../../../../components/ui/AlertBanner';
import Button from '../../../../components/ui/Button';
import TextField from '../../../../components/ui/TextField';
import { useAuthSession } from '../../../../hooks/useAuthSession';
import { PRODUCT_CATEGORIES, getCategoryLabel } from '../../../../lib/categories';
import { createProduct } from '../../../../lib/api';
import type { ProductCategory } from '../../../../lib/types';
import { useNotificationStore } from '../../../../stores/useNotificationStore';

const categoryOptions = PRODUCT_CATEGORIES.filter(
    (item): item is { label: string; value: ProductCategory; description?: string } => item.value !== 'all',
);

const SAMPLE_IMAGES = [
    'https://images.pexels.com/photos/288621/pexels-photo-288621.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=800',
];

type FormErrors = Partial<Record<'title' | 'description' | 'price' | 'stock' | 'category' | 'createdBy', string>>;

function formatPrice(value: string) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return '--';
    }
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(
        parsed,
    );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    return (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                {subtitle ? <p className="mt-1 text-sm text-gray-500">{subtitle}</p> : null}
            </div>
            {children}
        </section>
    );
}

export default function NewProductPage() {
    const router = useRouter();
    const session = useAuthSession();
    const pushNotification = useNotificationStore((state) => state.push);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [category, setCategory] = useState<ProductCategory>('livestock');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('1');
    const [location, setLocation] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!session.ready) {
            return;
        }

        if (!session.authenticated) {
            router.replace('/login');
        }
    }, [session.ready, session.authenticated, router]);

    const completion = useMemo(() => {
        let score = 0;
        if (title.trim()) score += 20;
        if (description.trim().length >= 10) score += 25;
        if (Number(price) >= 0 && price !== '') score += 20;
        if (Number(stock) >= 1) score += 15;
        if (category) score += 10;
        if (imageUrl.trim() || location.trim()) score += 10;
        return Math.min(score, 100);
    }, [title, description, price, stock, category, imageUrl, location]);

    const validate = () => {
        const nextErrors: FormErrors = {};
        if (!title.trim()) {
            nextErrors.title = 'Title is required.';
        }
        if (!description.trim() || description.trim().length < 10) {
            nextErrors.description = 'Description must be at least 10 characters.';
        }
        const parsedPrice = Number(price);
        if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
            nextErrors.price = 'Enter a valid price greater than or equal to 0.';
        }
        const parsedStock = Number(stock);
        if (!Number.isInteger(parsedStock) || parsedStock < 1) {
            nextErrors.stock = 'Stock must be an integer greater than or equal to 1.';
        }
        if (!session.userId) {
            nextErrors.createdBy = 'Authenticated user not found.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmitError('');

        if (!session.isSeller) {
            setSubmitError('Your current role does not have permission to publish products.');
            return;
        }

        if (!validate() || !session.userId) {
            return;
        }

        setIsSubmitting(true);

        try {
            const product = await createProduct({
                title: title.trim(),
                description: description.trim(),
                imageUrl: imageUrl.trim() || undefined,
                category,
                price: Number(price),
                stock: Number(stock),
                location: location.trim() || undefined,
                createdBy: session.userId,
            });

            pushNotification('success', `Product "${product.title}" published successfully.`);
            router.push(`/productos/${product.id}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to publish the product.';
            setSubmitError(message);
            pushNotification('error', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!session.ready) {
        return <p className="rounded-lg bg-white p-3 text-sm text-gray-700">Loading...</p>;
    }

    return (
        <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wide text-[#2f7d4d]">Publish product</p>
                    <h1 className="mt-1 text-3xl font-bold text-gray-900">Create your listing</h1>
                    <p className="mt-2 max-w-2xl text-sm text-gray-600">
                        Complete your product information. The more detailed your listing, the more trust you will build
                        with buyers.
                    </p>
                </div>
                <Link
                    href="/"
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Back to feed
                </Link>
            </div>

            {!session.isSeller && (
                <div className="mb-5">
                    <AlertBanner
                        variant="warning"
                        message="You need a seller account to publish. Try seller1@vincobov.com / Seller123*"
                    />
                </div>
            )}

            {submitError && (
                <div className="mb-5">
                    <AlertBanner variant="error" message={submitError} />
                </div>
            )}

            <div className="mb-5 rounded-2xl border border-green-100 bg-green-50/60 p-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-green-900">Listing progress</span>
                    <span className="font-bold text-green-800">{completion}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-green-100">
                    <div
                        className="h-full rounded-full bg-[#2f7d4d] transition-all duration-300"
                        style={{ width: `${completion}%` }}
                    />
                </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                <form
                    className="space-y-5"
                    onSubmit={(event) => {
                        void handleSubmit(event);
                    }}
                    data-testid="new-product-form"
                >
                    <SectionCard title="Basic information" subtitle="Product title, description, and category.">
                        <div className="space-y-4">
                            <TextField
                                label="Product title"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                placeholder="E.g. Angus steer 450 kg"
                                required
                                errorText={errors.title}
                            />
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <span className="text-xs text-gray-500">{description.length} characters</span>
                                </div>
                                <textarea
                                    className="min-h-32 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="Describe condition, origin, weight, delivery, and any relevant details..."
                                    required
                                />
                                {errors.description ? (
                                    <p className="mt-1 text-xs text-rose-500">{errors.description}</p>
                                ) : (
                                    <p className="mt-1 text-xs text-gray-500">Minimum 10 characters.</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {categoryOptions.map((option) => {
                                        const selected = category === option.value;
                                        return (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setCategory(option.value)}
                                                className={`rounded-xl border p-3 text-left transition ${
                                                    selected
                                                        ? 'border-green-700 bg-green-50 ring-2 ring-green-100'
                                                        : 'border-gray-200 bg-white hover:border-green-300'
                                                }`}
                                            >
                                                <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                                {option.description ? (
                                                    <p className="mt-1 text-xs text-gray-600">{option.description}</p>
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        title="Price and inventory"
                        subtitle="Set how much it costs and how many units you have."
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                label="Price (COP)"
                                type="number"
                                min={0}
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                placeholder="1500000"
                                required
                                errorText={errors.price}
                            />
                            <TextField
                                label="Available stock"
                                type="number"
                                min={1}
                                value={stock}
                                onChange={(event) => setStock(event.target.value)}
                                required
                                errorText={errors.stock}
                            />
                        </div>
                    </SectionCard>

                    <SectionCard title="Location and image" subtitle="Help buyers locate and visualize your product.">
                        <div className="space-y-4">
                            <TextField
                                label="Location"
                                value={location}
                                onChange={(event) => setLocation(event.target.value)}
                                placeholder="E.g. Tunja, Boyacá"
                            />
                            <TextField
                                label="Image URL (optional)"
                                value={imageUrl}
                                onChange={(event) => setImageUrl(event.target.value)}
                                placeholder="https://images.pexels.com/..."
                            />
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Sample images
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {SAMPLE_IMAGES.map((sample) => (
                                        <button
                                            key={sample}
                                            type="button"
                                            onClick={() => setImageUrl(sample)}
                                            className="relative h-14 w-20 overflow-hidden rounded-lg border border-gray-200 hover:border-green-600"
                                        >
                                            <Image src={sample} alt="" fill className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    <div className="flex flex-wrap gap-3">
                        <Button type="submit" disabled={isSubmitting || !session.isSeller}>
                            {isSubmitting ? 'Publishing...' : 'Publish product'}
                        </Button>
                        <Link
                            href="/mis-posts"
                            className="rounded-md border border-green-700 px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50"
                        >
                            View my listings
                        </Link>
                    </div>
                </form>

                <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <p className="border-b border-gray-100 px-4 py-3 text-xs font-bold uppercase tracking-wide text-gray-600">
                            Preview
                        </p>
                        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                            {imageUrl.trim() ? (
                                <Image src={imageUrl.trim()} alt="Preview" fill className="object-cover" unoptimized />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-gray-500">
                                    <span className="text-3xl">📷</span>
                                    <span>Add an image to highlight your listing</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4">
                            <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                                {getCategoryLabel(category)}
                            </span>
                            <p className="mt-3 line-clamp-2 text-xl font-bold text-gray-900">
                                {title.trim() || 'Product title'}
                            </p>
                            <p className="mt-2 text-3xl font-bold text-[#2f7d4d]">{formatPrice(price)}</p>
                            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-600">
                                {description.trim() || 'The description will appear here as you type.'}
                            </p>
                            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                                <div>
                                    <p className="font-semibold text-gray-500">Stock</p>
                                    <p className="mt-1 text-sm font-bold text-gray-900">{stock || 0} units</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-500">Location</p>
                                    <p className="mt-1 text-sm font-bold text-gray-900">
                                        {location.trim() || 'Colombia'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                        <p className="font-semibold">Tips to sell more</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-relaxed">
                            <li>Use a clear title with weight, breed, or product type.</li>
                            <li>Include delivery, health, or certification details.</li>
                            <li>Upload a sharp image to build more trust.</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
