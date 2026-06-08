import { clearAuthSession, getAuthHeaders } from './auth';
import type {
    ApiCart,
    CartCheckoutResult,
    ApiErrorBody,
    ApiChat,
    ApiFavorite,
    ApiMessage,
    ApiNotification,
    AdvanceShippingResult,
    ApiOrder,
    ApiProduct,
    ApiProductReview,
    ApiUser,
    ProductCategory,
    PurchaseResult,
} from './types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export function parseApiError(body: ApiErrorBody | null, fallback: string) {
    const backendMessage = body?.message;
    if (typeof backendMessage === 'string') {
        return backendMessage;
    }
    if (Array.isArray(backendMessage)) {
        return backendMessage.join(', ');
    }
    return fallback;
}

export class AuthRequiredError extends Error {
    constructor() {
        super('Your session has expired. Please log in again.');
        this.name = 'AuthRequiredError';
    }
}

export function isAuthRequiredError(error: unknown) {
    return error instanceof AuthRequiredError;
}

let authRedirectInFlight = false;

function redirectToLoginAfterAuthFailure() {
    if (authRedirectInFlight || typeof window === 'undefined') {
        return;
    }
    if (window.location.pathname.startsWith('/login')) {
        return;
    }

    authRedirectInFlight = true;
    clearAuthSession();
    const returnUrl = encodeURIComponent(`${window.location.pathname}${window.location.search}`);
    window.location.assign(`/login?returnUrl=${returnUrl}&reason=session-expired`);
}

function rejectApiError(response: Response, body: ApiErrorBody | null, fallback: string): never {
    if (response.status === 401) {
        redirectToLoginAfterAuthFailure();
        throw new AuthRequiredError();
    }

    throw new Error(parseApiError(body, fallback));
}

export async function fetchProducts(params: {
    category?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    createdBy?: number;
    limit?: number;
    offset?: number;
}) {
    const searchParams = new URLSearchParams();
    if (params.category && params.category !== 'all') {
        searchParams.set('category', params.category);
    }
    if (params.location) {
        searchParams.set('location', params.location);
    }
    if (params.minPrice !== undefined) {
        searchParams.set('minPrice', String(params.minPrice));
    }
    if (params.maxPrice !== undefined) {
        searchParams.set('maxPrice', String(params.maxPrice));
    }
    if (params.createdBy !== undefined) {
        searchParams.set('createdBy', String(params.createdBy));
    }
    if (params.limit !== undefined) {
        searchParams.set('limit', String(params.limit));
    }
    if (params.offset !== undefined) {
        searchParams.set('offset', String(params.offset));
    }

    const response = await fetch(`${API_BASE_URL}/product?${searchParams.toString()}`, {
        headers: getAuthHeaders(),
    });

    const body = (await response.json().catch(() => null)) as ApiProduct[] | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load products.');
    }

    return (body ?? []) as ApiProduct[];
}

export async function fetchProductById(id: number) {
    const response = await fetch(`${API_BASE_URL}/product/${id}`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiProduct | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Product not found.');
    }

    return body as ApiProduct;
}

export async function createProduct(payload: {
    title: string;
    description: string;
    imageUrl?: string;
    category: ProductCategory;
    price: number;
    stock: number;
    location?: string;
    createdBy: number;
}) {
    const response = await fetch(`${API_BASE_URL}/product`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiProduct | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not publish the product.');
    }

    return body as ApiProduct;
}

export async function purchaseProduct(productId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/product/${productId}/purchase`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ quantity }),
    });
    const body = (await response.json().catch(() => null)) as PurchaseResult | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not complete the purchase.');
    }

    return body as PurchaseResult;
}

export async function fetchUserById(id: number) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiUser | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load profile.');
    }

    return body as ApiUser;
}

export async function fetchCart() {
    const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiCart | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load cart.');
    }

    return body as ApiCart;
}

export async function addCartItem(productId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId, quantity }),
    });
    const body = (await response.json().catch(() => null)) as ApiCart | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not add item to cart.');
    }
    return body as ApiCart;
}

export async function updateCartItem(itemId: number, quantity: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ quantity }),
    });
    const body = (await response.json().catch(() => null)) as ApiCart | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not update cart.');
    }
    return body as ApiCart;
}

export async function removeCartItem(itemId: number) {
    const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiCart | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not remove item from cart.');
    }
    return body as ApiCart;
}

export async function checkoutCart() {
    const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as CartCheckoutResult | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not complete checkout.');
    }
    return body as CartCheckoutResult;
}

export async function fetchSellerOrders() {
    const response = await fetch(`${API_BASE_URL}/orders/seller/me`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiOrder[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load sales history.');
    }
    return (body ?? []) as ApiOrder[];
}

export async function fetchOrderById(orderId: number) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiOrder | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load order.');
    }
    return body as ApiOrder;
}

export async function advanceOrderShipping(orderId: number) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/advance-shipping`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as AdvanceShippingResult | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not update shipping status.');
    }
    return body as AdvanceShippingResult;
}

export async function fetchNotifications() {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiNotification[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load notifications.');
    }
    return (body ?? []) as ApiNotification[];
}

export async function markNotificationRead(id: number) {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiNotification | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not mark notification as read.');
    }
    return body as ApiNotification;
}

export async function markAllNotificationsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not mark all notifications as read.');
    }
    return body as { message?: string };
}

export async function fetchChats() {
    const response = await fetch(`${API_BASE_URL}/chats`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiChat[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load chats.');
    }
    return (body ?? []) as ApiChat[];
}

export async function fetchMessages() {
    const response = await fetch(`${API_BASE_URL}/messages`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiMessage[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load messages.');
    }
    return (body ?? []) as ApiMessage[];
}

export async function findOrCreateChat(payload: { sellerId: number; buyerId: number }) {
    const response = await fetch(`${API_BASE_URL}/chats/find-or-create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiChat | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not start the conversation.');
    }
    return body as ApiChat;
}

export async function createMessage(payload: { chatId: number; senderId: number; content: string }) {
    const response = await fetch(`${API_BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiMessage | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not send message.');
    }
    return body as ApiMessage;
}

export async function fetchProductReviews(productId: number) {
    const response = await fetch(`${API_BASE_URL}/reviews?productId=${productId}`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiProductReview[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load reviews.');
    }
    return (body ?? []) as ApiProductReview[];
}

export async function createProductReview(payload: { productId: number; rating: number; comment: string }) {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiProductReview | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not submit review.');
    }
    return body as ApiProductReview;
}

export async function fetchFavorites() {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as ApiFavorite[] | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not load favorites.');
    }
    return (body ?? []) as ApiFavorite[];
}

export async function checkFavorite(productId: number) {
    const response = await fetch(`${API_BASE_URL}/favorites/check?productId=${productId}`, {
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as boolean | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not check favorite status.');
    }
    return Boolean(body);
}

export async function addFavorite(productId: number) {
    const response = await fetch(`${API_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify({ productId }),
    });
    const body = (await response.json().catch(() => null)) as ApiFavorite | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not add to favorites.');
    }
    return body as ApiFavorite;
}

export async function removeFavorite(productId: number) {
    const response = await fetch(`${API_BASE_URL}/favorites?productId=${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | ApiErrorBody | null;
    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not remove from favorites.');
    }
    return body as { message?: string };
}

export async function updateUser(
    id: number,
    payload: Partial<{
        username: string;
        bio: string;
        email: string;
        avatarUrl: string;
        profileDescription: string;
        roleId: number;
    }>,
) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as ApiUser | ApiErrorBody | null;

    if (!response.ok) {
        rejectApiError(response, body as ApiErrorBody | null, 'Could not update profile.');
    }

    return body as ApiUser;
}

export function filterProductsBySearch(products: ApiProduct[], query: string) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
        return products;
    }

    return products.filter((product) => {
        const haystack =
            `${product.title} ${product.description} ${product.location ?? ''} ${product.category}`.toLowerCase();
        return haystack.includes(normalized);
    });
}
