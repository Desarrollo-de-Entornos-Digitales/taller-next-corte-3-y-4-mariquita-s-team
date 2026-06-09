import { APIRequestContext, Page, test } from '@playwright/test';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export const CREDENTIALS = {
    buyer: { email: 'buyer1@vincobov.com', password: 'Buyer123*', username: 'buyer1' },
    seller: { email: 'seller1@vincobov.com', password: 'Seller123*', username: 'seller1' },
} as const;

export async function skipIfBackendUnavailable(request: APIRequestContext) {
    try {
        const health = await request.get(`${API_URL}/`);
        if (!health.ok()) {
            test.skip(true, 'Backend unavailable at NEXT_PUBLIC_API_URL');
        }
    } catch {
        test.skip(true, 'Backend unavailable at NEXT_PUBLIC_API_URL');
    }
}

export async function loginAs(page: Page, email: string, password: string) {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.getByLabel('Email Address').fill(email);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Log In' }).click();
    await page.waitForURL('/', { timeout: 15_000 });
}

export async function loginAsBuyer(page: Page) {
    await loginAs(page, CREDENTIALS.buyer.email, CREDENTIALS.buyer.password);
}

export async function loginAsSeller(page: Page) {
    await loginAs(page, CREDENTIALS.seller.email, CREDENTIALS.seller.password);
}
