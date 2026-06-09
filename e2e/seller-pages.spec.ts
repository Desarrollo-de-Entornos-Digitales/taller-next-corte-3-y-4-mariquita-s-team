import { expect, test } from '@playwright/test';

import { loginAsSeller, skipIfBackendUnavailable } from './helpers';

test.describe('Seller-only pages', () => {
    test.beforeEach(async ({ request, page }) => {
        await skipIfBackendUnavailable(request);
        await loginAsSeller(page);
    });

    test('opens my listings page', async ({ page }) => {
        await page.goto('/mis-posts');
        await expect(page.getByRole('heading', { name: 'My listings' })).toBeVisible({ timeout: 15_000 });
    });

    test('opens sales history page', async ({ page }) => {
        await page.goto('/historial-ventas');
        await expect(page.getByRole('heading', { name: 'Sales history' })).toBeVisible({ timeout: 15_000 });
    });
});
