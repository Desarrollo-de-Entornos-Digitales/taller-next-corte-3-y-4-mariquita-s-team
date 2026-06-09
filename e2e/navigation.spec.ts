import { expect, test } from '@playwright/test';

import { loginAsBuyer, skipIfBackendUnavailable } from './helpers';

test.describe('Buyer app navigation', () => {
    test.beforeEach(async ({ request, page }) => {
        await skipIfBackendUnavailable(request);
        await loginAsBuyer(page);
    });

    test('opens cart page', async ({ page }) => {
        await page.getByTestId('navbar-cart-link').click();
        await expect(page).toHaveURL('/carrito');
        await expect(page.getByRole('heading', { name: 'Cart' })).toBeVisible();
    });

    test('opens favorites page', async ({ page }) => {
        await page.goto('/favoritos');
        await expect(page.getByRole('heading', { name: 'Favorites' })).toBeVisible({ timeout: 15_000 });
    });

    test('opens messages page', async ({ page }) => {
        await page.goto('/mensajes');
        await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible({ timeout: 15_000 });
    });

    test('opens notifications page', async ({ page }) => {
        await page.goto('/notificaciones');
        await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible({ timeout: 15_000 });
    });
});
