type ProductCardProps = {
    id: number;
    title: string;
    description: string;
    category: string;
    price: number;
    location?: string;
    sellerName?: string;
    onClick?: (id: number) => void;
};

function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', {
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
    location,
    sellerName,
    onClick,
}: ProductCardProps) {
    return (
        <article
            className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
            onClick={() => onClick?.(id)}
        >
            <div className="flex h-28 items-center justify-center bg-[#d1d5db]">
                <div className="h-11 w-11 border-4 border-[#e5e7eb]" />
            </div>
            <div className="p-3">
                <p className="text-xs font-semibold text-gray-500">Category</p>
                <h3 className="line-clamp-2 text-[17px] font-semibold leading-tight text-gray-900">{title}</h3>
                <p className="mt-1 text-[28px] font-bold leading-none text-gray-900">{formatPrice(price)}</p>
                <p className="mt-2 line-clamp-2 text-sm text-gray-500">{description}</p>
                <div className="mt-3 space-y-0.5 text-sm text-gray-500">
                    <p className="font-medium text-gray-700">{sellerName ?? 'Vendedor VincoBov'}</p>
                    <p>{location || 'Colombia'}</p>
                    <p className="text-xs uppercase tracking-wide text-green-700">{category}</p>
                </div>
            </div>
        </article>
    );
}
