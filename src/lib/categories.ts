import type { ProductCategory } from './types';

export const PRODUCT_CATEGORIES: { label: string; value: ProductCategory | 'all'; description?: string }[] = [
    { label: 'All', value: 'all' },
    {
        label: 'Livestock',
        value: 'livestock',
        description: 'Cattle, sheep, poultry, and other farm animals.',
    },
    {
        label: 'Agriculture',
        value: 'agriculture',
        description: 'Fresh produce such as potatoes, vegetables, fruits, and grains.',
    },
    {
        label: 'Refined',
        value: 'refined',
        description: 'Processed and packaged agricultural products.',
    },
    {
        label: 'Supplies & Equipment',
        value: 'supplies_equipment',
        description: 'Inputs, tools, machinery, and equipment for agricultural activities.',
    },
];

export const ROLE_PROFILES = {
    buyer: {
        title: 'Buyer Profile',
        description:
            'Browse listings, compare prices, save favorites, and contact sellers directly. Your profile helps sellers understand what you are looking for.',
        highlights: [
            'Discover livestock, crops, and farm supplies',
            'Message sellers and negotiate deals',
            'Track favorites and purchase history',
        ],
    },
    seller: {
        title: 'Seller Profile',
        description:
            'Publish products, manage inventory, and connect with buyers across the countryside. Your profile builds trust with potential customers.',
        highlights: [
            'List livestock, agriculture products, and equipment',
            'Receive messages from interested buyers',
            'Showcase your farm or business identity',
        ],
    },
} as const;

export function getCategoryLabel(category: string) {
    return PRODUCT_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
