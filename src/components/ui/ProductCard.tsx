import Image from 'next/image';
import Link from 'next/link';

import { getCategoryLabel } from '../../lib/categories';

type ProductCardProps = {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    imageUrl?: string;
    location?: string;
    sellerName?: string;
    onClick?: (id: number) => void;
};

function formatPrice(price: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(price);
}

export default function ProductCard({
    id,
    title,
    description,
    category,
    price,
    imageUrl,
    location,
    sellerName,
    onClick,
}: ProductCardProps) {
    return (
        <Link
            href={`/productos/${id}`}
            className="block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
            onClick={() => onClick?.(id)}
            data-testid={`product-card-${id}`}
        >
            <div className="relative h-36 bg-[#d1d5db]">
                {imageUrl ? (
                    <Image src={imageUrl} alt={title} fill className="object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <div className="h-11 w-11 border-4 border-[#e5e7eb]" />
                    </div>
                )}
            </div>
            <div className="p-3">
                <p className="text-xs font-semibold text-gray-500">Category</p>
                <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-gray-900">{title}</h3>
                <p className="mt-1 text-[28px] font-bold leading-none text-gray-900">{formatPrice(price)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{description}</p>
                <div className="mt-3 space-y-0.5 text-sm text-gray-500">
                    <p className="font-medium text-gray-700">{sellerName ?? 'VincoBov Seller'}</p>
                    <p>{location || 'Colombia'}</p>
                    <p className="text-xs uppercase tracking-wide text-green-700">{getCategoryLabel(category)}</p>
                </div>
            </div>
        </Link>
    );
}
