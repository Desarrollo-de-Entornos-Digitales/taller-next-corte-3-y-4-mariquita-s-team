export type ProductCategory = 'livestock' | 'agriculture' | 'refined' | 'supplies_equipment';

export type ApiProduct = {
    id: number;
    title: string;
    description: string;
    category: ProductCategory;
    price: number | string;
    stock?: number;
    imageUrl?: string | null;
    location?: string | null;
    createdAt?: string;
    createdBy?: {
        id?: number;
        username?: string;
        email?: string;
        bio?: string;
        avatarUrl?: string | null;
        profileDescription?: string | null;
        role?: {
            name?: string;
        };
    };
};

export type ApiUser = {
    id: number;
    username: string;
    email: string;
    bio?: string | null;
    avatarUrl?: string | null;
    profileDescription?: string | null;
    createdAt?: string;
    role?: {
        id?: number;
        name?: string;
    };
};

export type ApiProductReview = {
    id: number;
    rating: number;
    comment: string;
    createdAt: string;
    user?: {
        id?: number;
        username?: string;
        avatarUrl?: string | null;
    };
    product?: ApiProduct;
};

export type ApiFavorite = {
    id: number;
    createdAt: string;
    product: ApiProduct;
};

export type PurchaseResult = {
    message: string;
    productId: number;
    buyerUserId: number;
    quantity: number;
    remainingStock: number;
    orderId?: number;
};

export type ApiErrorBody = {
    message?: string | string[];
    statusCode?: number;
};

export type ApiCartItem = {
    id: number;
    product: ApiProduct;
    quantity: number;
    unitPrice: number | string;
    totalPrice?: number | string;
    createdAt?: string;
    updatedAt?: string;
};

export type ApiCart = {
    id: number;
    buyerId: number;
    items: ApiCartItem[];
    createdAt?: string;
    updatedAt?: string;
};

export type CartCheckoutResult = {
    message: string;
    orderIds: number[];
};

export type ApiNotificationType = 'purchase' | 'message' | 'system' | 'shipping';

export type ApiNotification = {
    id: number;
    type: ApiNotificationType;
    title: string;
    body: string;
    metadata?: Record<string, unknown> | null;
    readAt?: string | null;
    createdAt: string;
};

export type ApiChat = {
    id: number;
    seller: ApiUser;
    buyer: ApiUser;
    createdAt: string;
};

export type ApiMessage = {
    id: number;
    chat: ApiChat;
    sender: ApiUser;
    content: string;
    createdAt: string;
};

export type ApiOrderStatus = 'pending' | 'paid' | 'cancelled';

export type ApiShippingStatus =
    | 'order_confirmed'
    | 'payment_verified'
    | 'preparing'
    | 'handed_to_carrier'
    | 'in_transit'
    | 'out_for_delivery'
    | 'delivered';

export type ApiOrder = {
    id: number;
    quantity: number;
    unitPrice: number | string;
    totalPrice: number | string;
    status: ApiOrderStatus;
    shippingStatus?: ApiShippingStatus | null;
    shippingDetails?: Record<string, unknown> | null;
    createdAt: string;
    buyer?: ApiUser;
    product?: ApiProduct;
};

export type AdvanceShippingResult = {
    order: ApiOrder;
    notification: ApiNotification | null;
    completed: boolean;
};
